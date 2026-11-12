import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const moduleUrl=pathToFileURL(path.resolve('src/config.mjs')).href;
test('arquivo local carrega sem substituir variável existente nem imprimir valores',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'palavras-api-config-'));
 const fixture=path.join(tmp,'fixture.env');fs.writeFileSync(fixture,'RUNWAYML_API_SECRET=fixture_runway\nPEXELS_API_KEY=fixture_pexels\n');
 try{const code=`import {loadExternalEnv,credentialStatus,getCredential} from ${JSON.stringify(moduleUrl)};loadExternalEnv(${JSON.stringify(fixture)});if(getCredential('runway')!=='process_override')process.exit(2);console.log(JSON.stringify(credentialStatus()));`;
 const result=spawnSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8',env:{...process.env,RUNWAYML_API_SECRET:'process_override',PEXELS_API_KEY:'',UNSPLASH_ACCESS_KEY:'',PIXABAY_API_KEY:''}});
 // Uma variável vazia preexistente tem precedência: não é configurada por acidente.
 assert.equal(result.status,0);assert.deepEqual(JSON.parse(result.stdout),{runway:true,pexels:false,unsplash:false,pixabay:false});assert.ok(!result.stdout.includes('fixture_'));assert.ok(!result.stdout.includes('process_override'));
 }finally{fs.rmSync(fixture);fs.rmdirSync(tmp);}
});
test('caminho inexistente não carrega arquivo arbitrário',()=>{
 const code=`import {loadExternalEnv} from ${JSON.stringify(moduleUrl)};console.log(JSON.stringify(loadExternalEnv('arquivo-inexistente.env')));`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8'});assert.equal(r.status,0);assert.equal(JSON.parse(r.stdout).file_present,false);
});
