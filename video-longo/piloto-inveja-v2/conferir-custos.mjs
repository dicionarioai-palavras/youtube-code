import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'');
const {loadExternalEnv,getCredential}=await import(pathToFileURL(root+'/code/apis-externas/src/config.mjs'));loadExternalEnv();
const {getRunwayBalance}=await import(pathToFileURL(root+'/code/apis-externas/src/runway-saldo.mjs'));
const dir=root+'/canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v2';const file=dir+'/originais/runway-ledger.json';const ledger=JSON.parse(fs.readFileSync(file));
for(const j of ledger.jobs){const r=await fetch('https://api.dev.runwayml.com/v1/tasks/'+j.id,{headers:{Authorization:'Bearer '+getCredential('runway'),'X-Runway-Version':'2024-11-06'}});if(!r.ok)throw Error('Conferência HTTP '+r.status);const data=await r.json();j.state=data.status;j.cost=data.cost??null;const local=dir+'/originais/'+j.name+(['gen4_turbo','gen4.5','aleph2'].includes(j.model)?'.mp4':'.png');if(fs.existsSync(local)){j.file=path.basename(local);j.sha256=crypto.createHash('sha256').update(fs.readFileSync(local)).digest('hex');}}
ledger.balance_after=await getRunwayBalance();ledger.actual_credits=ledger.jobs.reduce((n,j)=>n+(j.cost?.credits??0),0);ledger.balance_difference=ledger.balance_before.credit_balance-ledger.balance_after.credit_balance;
fs.writeFileSync(file,JSON.stringify(ledger,null,2));fs.writeFileSync(dir+'/entrega/05-registros/runway-custos.json',JSON.stringify(ledger,null,2));console.log(JSON.stringify({jobs:ledger.jobs.map(j=>({name:j.name,state:j.state,credits:j.cost?.credits})),total:ledger.actual_credits,remaining:ledger.balance_after.credit_balance,balance_difference:ledger.balance_difference}));
