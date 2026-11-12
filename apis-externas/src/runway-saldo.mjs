import {getCredential} from './config.mjs';
export async function getRunwayBalance({fetchImpl=fetch}={}){
 const key=getCredential('runway');let res;
 try{res=await fetchImpl('https://api.dev.runwayml.com/v1/organization',{method:'GET',headers:{Authorization:'Bearer '+key,'X-Runway-Version':'2024-11-06'},signal:AbortSignal.timeout(20000),redirect:'error'});}catch{throw Error('Falha de conexão Runway; credencial e resposta bruta omitidas');}
 if(!res.ok){const error=Error('Runway HTTP '+res.status);error.status=res.status;throw error;}
 let data;try{data=await res.json();}catch{throw Error('Resposta Runway inválida');}
 if(typeof data.creditBalance!=='number'||!Number.isFinite(data.creditBalance)||data.creditBalance<0)throw Error('Saldo ausente/inválido; não presumir zero');
 const limits={};for(const model of ['gen4_image','gen4_image_turbo','gen4_turbo','gen4.5']){
 const tier=data.tier?.models?.[model];const usage=data.usage?.models?.[model];limits[model]={max_concurrent:tier?.maxConcurrentGenerations??null,max_daily:tier?.maxDailyGenerations??null,daily_generations:usage?.dailyGenerations??null,note:'null significa não informado ou ilimitado; conferir portal antes de escalar.'};}
 return {status:res.status,credit_balance:data.creditBalance,usd_equivalent:Number((data.creditBalance*0.01).toFixed(2)),limits,checked_at:new Date().toISOString(),scope:'API organization da chave usada; não é saldo do app web',generations:0};
}
