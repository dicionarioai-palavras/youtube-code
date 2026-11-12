import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {loadExternalEnv,getCredential} from './config.mjs';
import {getRunwayBalance} from './runway-saldo.mjs';
import {estimate} from './runway-custos.mjs';
loadExternalEnv();
export async function runwayJob({dir,name,endpoint,body,expectedCredits,inputSeconds,ceiling=150}){
 // Validação local do prompt antes de qualquer POST ou reserva de créditos.
 if(['gen4_image','gen4_image_turbo','gen4_turbo','gen4.5'].includes(body.model)&&(!body.promptText?.trim()||body.promptText.length>1000))throw Error('Prompt deve ter1–1000 unidades UTF-16; compilar direção antes de enviar.');
 fs.mkdirSync(dir,{recursive:true});const lock=path.join(dir,'.runway-executor.lock');let fd;
 try{fd=fs.openSync(lock,'wx');}catch{throw Error('Executor já ativo ou trava pendente. Conferir tarefa antes de retomar.');}
 try{return await executeJob({dir,name,endpoint,body,expectedCredits,inputSeconds,ceiling});}finally{fs.closeSync(fd);try{fs.unlinkSync(lock);}catch{try{fs.writeFileSync(lock+'.liberada',new Date().toISOString());}catch{}console.warn('Aviso: trava não pôde ser apagada (pasta sem permissão de exclusão). Tarefa concluída; apague '+path.basename(lock)+' para reutilizar este diretório.');}}
}
async function executeJob({dir,name,endpoint,body,expectedCredits,inputSeconds,ceiling}){
 const calculated=estimate({model:body.model,...(endpoint==='video_to_video'?{seconds:inputSeconds}:endpoint==='image_to_video'?{seconds:body.duration}:{resolution:body.ratio==='1920:1080'?'1080p':'720p'})}).credits;
 if(expectedCredits!==calculated)throw Error('Preço não corresponde ao calculador validado.');
 fs.mkdirSync(dir,{recursive:true});
 const ledgerPath=path.join(dir,'runway-ledger.json');
 let ledger=fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath)): {ceiling,created_at:new Date().toISOString(),jobs:[]};
 const hash=crypto.createHash('sha256').update(JSON.stringify({endpoint,body})).digest('hex');
 let job=ledger.jobs.find(j=>j.name===name);
 const save=()=>{const disk=fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath)):ledger;const jobs=new Map(disk.jobs.map(j=>[j.name,j]));if(job)jobs.set(job.name,job);ledger={...ledger,...disk,jobs:[...jobs.values()]};fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2));};
 async function api(route,options={}){
  let r;try{r=await fetch('https://api.dev.runwayml.com/v1/'+route,{...options,headers:{Authorization:'Bearer '+getCredential('runway'),'X-Runway-Version':'2024-11-06','Content-Type':'application/json'},signal:AbortSignal.timeout(45000)});}catch{throw Error('Conexão Runway interrompida. Nenhum POST será repetido automaticamente.');}
  if(!r.ok){const e=Error('Runway HTTP '+r.status);e.status=r.status;throw e;}return r.json();
 }
 if(job&&job.hash!==hash)throw Error('Receita mudou: criar nova rodada, sem reutilizar tarefa antiga.');
 if(!job){
  const reserved=ledger.jobs.reduce((s,j)=>s+j.expected_credits,0);
  if(reserved+expectedCredits>Math.min(150,ceiling,ledger.ceiling))throw Error('Teto de créditos excedido.');
  const balance=await getRunwayBalance();if(balance.credit_balance<expectedCredits)throw Error('Saldo insuficiente.');
  ledger.balance_before??=balance;job={name,hash,expected_credits:expectedCredits,state:'SUBMITTING',created_at:new Date().toISOString(),model:body.model};ledger.jobs.push(job);save();
  try{const task=await api(endpoint,{method:'POST',body:JSON.stringify(body)});job.id=task.id;job.estimated_cost=task.estimatedCost??null;job.state='PENDING';save();}catch(e){job.state='SUBMISSION_UNCERTAIN';job.http_status=e.status??null;save();throw e;}
 }
 if(!job.id)throw Error('Envio anterior incerto. Consultar portal; não reenviar.');
 if(job.state==='FAILED'||job.state==='CANCELLED')throw Error('Tarefa encerrada sem sucesso; sem repetição automática.');
 let task;
 for(let i=0;i<180;i++){
  task=await api('tasks/'+job.id);job.state=task.status;job.cost=task.cost??null;save();
  if(task.status==='SUCCEEDED')break;
  if(['FAILED','CANCELLED'].includes(task.status))throw Error('Tarefa Runway '+task.status+'; sem repetição.');
  await new Promise(r=>setTimeout(r,10000));
 }
 if(task?.status!=='SUCCEEDED')throw Error('Tarefa pendente. Retomar com mesmo ID.');
 const ext=endpoint.endsWith('_to_video')?'.mp4':'.png';const file=path.join(dir,name+ext);
 if(!fs.existsSync(file)){const r=await fetch(task.output[0],{signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('Download de saída HTTP '+r.status);fs.writeFileSync(file,Buffer.from(await r.arrayBuffer()));}
 job.file=path.basename(file);job.sha256=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');job.finished_at=new Date().toISOString();save();
 return {file,uri:task.output[0],id:job.id};
}
