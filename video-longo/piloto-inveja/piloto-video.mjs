import fs from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'');
const {runwayJob}=await import(pathToFileURL(root+'/code/apis-externas/src/runway-gerar.mjs'));
const dir=root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v1/originais';
const bytes=fs.readFileSync(dir+'/restaurante-base.png');if(bytes.length>3500000)throw Error('Referência excede limite conservador');
const body={model:'gen4_turbo',ratio:'1280:720',duration:10,promptImage:'data:image/png;base64,'+bytes.toString('base64'),promptText:'Locked-off cinematic wide shot. The wooden restaurant table slowly stretches sideways between the two seated friends, becoming impossibly long. The left man stays on the left and the right man stays on the right, both quietly holding their polite expressions. The growing empty space in the middle becomes the focus. Subtle hand-drawn animation, consistent painted ink texture and lighting. One continuous shot, no cuts, no text, no camera rotation.'};
fs.writeFileSync(dir+'/video-receita.json',JSON.stringify({...body,promptImage:'restaurante-base.png (referência local enviada como data URI)',expected_credits:50},null,2));
const result=await runwayJob({dir,name:'mesa-distancia',endpoint:'image_to_video',body,expectedCredits:50});console.log({file:result.file,id:result.id});
