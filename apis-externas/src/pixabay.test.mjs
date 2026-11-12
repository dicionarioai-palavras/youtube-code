import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {searchPixabay} from './pixabay.mjs';
test('cache de 24h evita segunda consulta e não grava a chave',async()=>{
 const cacheDir=fs.mkdtempSync(path.join(os.tmpdir(),'palavras-pixabay-'));let calls=0;const key='fixture-secret';
 const fetchImpl=async()=>{calls++;return new Response(JSON.stringify({total:1,totalHits:1,hits:[{id:7,type:'photo',tags:'house',pageURL:'https://pixabay.com/photos/id-7/',user:'author',imageWidth:2000,imageHeight:1200,largeImageURL:'https://cdn.pixabay.com/photo/test.jpg'}]}),{status:200});};
 try{const a=await searchPixabay('image','house',{cacheDir,apiKey:key,fetchImpl});const b=await searchPixabay('image','house',{cacheDir,apiKey:key,fetchImpl});assert.equal(calls,1);assert.equal(a.cache_hit,false);assert.equal(b.cache_hit,true);for(const f of fs.readdirSync(cacheDir))assert.ok(!fs.readFileSync(path.join(cacheDir,f),'utf8').includes(key));}
 finally{for(const f of fs.readdirSync(cacheDir))fs.unlinkSync(path.join(cacheDir,f));fs.rmdirSync(cacheDir);}
});
test('erro remoto não revela chave ou resposta bruta',async()=>{await assert.rejects(searchPixabay('video','error-check',{cacheDir:path.join(os.tmpdir(),'palavras-pixabay-errors'),apiKey:'fixture-secret',fetchImpl:async()=>new Response('fixture-secret',{status:401})}),e=>e.status===401&&!e.message.includes('fixture-secret'));});
