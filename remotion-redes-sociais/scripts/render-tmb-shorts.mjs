import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import {execSync} from 'node:child_process';
const b='/usr/bin/google-chrome';
const S=JSON.parse(fs.readFileSync('src/canal-dark/ep01-shorts.json','utf8'));
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
for (const s of S){
  const out=`out/canal-dark/shorts/${s.id}.mp4`;
  if (fs.existsSync(out)) continue;
  const c=await selectComposition({serveUrl,id:`tmb-ep01-${s.id}`,browserExecutable:b});
  const mudo=`/tmp/mont/${s.id}-mudo.mp4`;
  await renderMedia({composition:c,serveUrl,browserExecutable:b,codec:'h264',crf:20,muted:true,concurrency:2,outputLocation:mudo});
  const d=s.dur;
  execSync(`ffmpeg -y -v error -i ${mudo} -ss ${s.t0} -t ${d} -i /tmp/mont/mix.wav -filter_complex "[1:a]afade=t=in:d=0.15,afade=t=out:st=${(d-1.5).toFixed(2)}:d=1.5[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart ${out}`);
  console.log('short ok',s.id,new Date().toISOString());
}
console.log('FIM SHORTS');
