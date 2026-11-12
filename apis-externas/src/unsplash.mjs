import {getCredential} from './config.mjs';
export async function searchUnsplash(query,{perPage=3}={}){
 if(typeof query!=='string'||!query.trim()||query.length>200)throw new Error('Consulta inválida.');
 const count=Math.max(1,Math.min(10,Math.trunc(perPage)));
 const url=new URL('https://api.unsplash.com/search/photos');url.searchParams.set('query',query);url.searchParams.set('per_page',String(count));url.searchParams.set('orientation','landscape');url.searchParams.set('content_filter','high');
 let res;
 try{res=await fetch(url,{headers:{Authorization:'Client-ID '+getCredential('unsplash'),'Accept-Version':'v1'},signal:AbortSignal.timeout(20000),redirect:'error'});}catch{throw new Error('Falha de conexão Unsplash; nenhum segredo foi exibido.');}
 const rate={limit:res.headers.get('x-ratelimit-limit'),remaining:res.headers.get('x-ratelimit-remaining')};
 if(!res.ok){const error=new Error('Unsplash respondeu HTTP '+res.status);error.status=res.status;throw error;}
 let data;try{data=await res.json();}catch{throw new Error('Resposta inválida Unsplash.');}
 return {status:res.status,query,total:data.total,rate,results:(data.results||[]).map(p=>({id:p.id,width:p.width,height:p.height,description:p.alt_description||p.description||'',author:p.user?.name,author_url:p.user?.links?.html,page_url:p.links?.html,preview_url:p.urls?.small,image_url:p.urls?.full,download_event:p.links?.download_location,attribution_required_by_api:true}))};
}
