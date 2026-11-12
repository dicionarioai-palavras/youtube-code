import fs from 'node:fs';
const prices=JSON.parse(fs.readFileSync(new URL('../runway-precos.json',import.meta.url),'utf8'));
export function estimate({model,resolution='1080p',seconds,quantity=1,attempts=1,outputFormat='mp4'}){
 if(!Number.isInteger(quantity)||quantity<1||!Number.isInteger(attempts)||attempts<1)throw Error('Quantidade/tentativas inválidas');
 let unit;
 if(prices.images[model]){if(seconds!==undefined)throw Error('Imagem não cobra segundos');unit=prices.images[model][resolution];if(unit===undefined)throw Error('Resolução não tabelada');}
 else if(model==='aleph2'){if(outputFormat!=='mp4'||!Number.isFinite(seconds)||seconds<=0||seconds>30)throw Error('Entrada Aleph fora do perfil calculado');unit=Math.max(56,28*seconds);}
 else if(prices.videos_per_second[model]){if(outputFormat!=='mp4')throw Error('Formato adicional não orçado');if(!Number.isInteger(seconds)||seconds<2||seconds>10)throw Error('Duração fora do perfil calculado');if(model==='gen4_turbo'&&![5,10].includes(seconds))throw Error('Perfil conservador Turbo: selecionar 5 ou 10 s; outros valores exigem confirmar suporte');unit=prices.videos_per_second[model]*seconds;}
 else throw Error('Modelo sem preço validado neste calculador');
 const credits=unit*quantity*attempts;return {model,resolution:prices.images[model]?resolution:undefined,seconds,quantity,attempts,unit_credits:unit,credits,usd:Number((credits*prices.usd_per_credit).toFixed(2)),status:'estimativa-local-nao-cobranca-medida'};
}
export function fitsBalance(cost,balance){if(!Number.isFinite(balance)||balance<0)return null;return cost.credits<=balance;}
