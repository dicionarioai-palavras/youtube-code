import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [id, ...frames] = process.argv.slice(2);
const b='/usr/bin/google-chrome';
const serveUrl=await bundle({entryPoint:path.resolve('src/entry-lote00.tsx')});
const c=await selectComposition({serveUrl,id,browserExecutable:b});
for (const f of frames){await renderStill({composition:c,serveUrl,browserExecutable:b,frame:Number(f),output:`/home/claude/lote00/out/${id}-${f}.jpg`,imageFormat:'jpeg',jpegQuality:80});console.log('ok',f);}
