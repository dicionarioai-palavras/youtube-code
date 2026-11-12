import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'');
const mod=await import(pathToFileURL(root+'/code/apis-externas/src/runway-gerar.mjs'));
const dir=root+'/canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v1/originais';
fs.mkdirSync(dir,{recursive:true});
const recipes=[
 {name:'restaurante-base',endpoint:'text_to_image',expectedCredits:8,body:{model:'gen4_image',ratio:'1920:1080',promptText:'Cinematic editorial illustration, wide horizontal frame. A modest Brazilian neighborhood restaurant at lunchtime. Two ordinary adult friends sit opposite each other across a small wooden table, bowls and water glasses, no logos. Closest to camera on left a dark-haired man in an olive shirt listens with a restrained polite smile; across right a friend in a blue shirt is sharing good news. Expressive hand drawn ink and softly textured painted shapes, sophisticated adult animation, warm window light against cool teal shadows, natural everyday gestures, atmospheric depth, elegant restrained composition. The table runs left to right between them, both people clearly visible. No words, no letters, no numbers, no speech bubbles.'}},
 {name:'sorriso-referencia',endpoint:'text_to_image',expectedCredits:2,body:{model:'gen4_image_turbo',ratio:'1920:1080',promptText:'Use @restaurante as visual continuity reference. Medium close-up of the same dark-haired adult man in the olive shirt at the same restaurant table. His polite smile stays frozen while his eyes reveal a tiny moment of discomfort. Same ink and painted texture, warm window light and teal shadows, background defocused. Understated emotion, sophisticated adult editorial animation. No writing, no symbols, no text.'}},
 {name:'calculadora-mental',endpoint:'text_to_image',expectedCredits:8,body:{model:'gen4_image',ratio:'1920:1080',promptText:'Cinematic editorial illustration for an essay about envy: a worn oversized pocket calculator floats in a dark petrol-blue mental space. Only the calculator at lower right third; its display and keys are blank, absolutely no writing or numbers, generous empty area on left for later typography. Thin amber rim light and a few delicate perspective lines suggesting measurement and comparison. Expressive hand drawn ink with softly painted textured shapes, sophisticated adult animation aesthetic, restrained and beautiful, rich shadows, no face, no letters, no text.'}}
];
fs.writeFileSync(path.dirname(dir)+'/receita-runway.json',JSON.stringify({scope:'Inveja somente',authorized_ceiling:150,estimated_credits:68,retries:0,recipes},null,2));
let base;
for(const recipe of recipes){if(recipe.name==='sorriso-referencia')recipe.body.referenceImages=[{uri:base.uri,tag:'restaurante'}];const result=await mod.runwayJob({dir,...recipe});if(recipe.name==='restaurante-base')base=result;console.log(JSON.stringify({name:recipe.name,file:result.file,id:result.id}));}
console.log('IMAGENS-CONCLUIDAS');
