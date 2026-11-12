import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const moduleRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const projectRoot=path.resolve(moduleRoot,'../..');
export function loadExternalEnv(envFile=path.join(moduleRoot,'.env')){
  if(!fs.existsSync(envFile))return {file_present:false};
  try{process.loadEnvFile(envFile);}catch{throw new Error('Arquivo local de credenciais inválido; confira o formato NOME=valor. Nenhum valor foi exibido.');}
  return {file_present:true};
}
export function credentialStatus(){return {runway:has(process.env.RUNWAYML_API_SECRET),pexels:has(process.env.PEXELS_API_KEY),unsplash:has(process.env.UNSPLASH_ACCESS_KEY),pixabay:has(process.env.PIXABAY_API_KEY),elevenlabs:has(process.env.ELEVENLABS_API_KEY)};}
function has(v){return !!v?.trim()&&!/^(cole|your_|sua_|placeholder|troque)/i.test(v.trim());}
export function getCredential(service){const names={runway:'RUNWAYML_API_SECRET',pexels:'PEXELS_API_KEY',unsplash:'UNSPLASH_ACCESS_KEY',pixabay:'PIXABAY_API_KEY',elevenlabs:'ELEVENLABS_API_KEY'};const name=names[service];if(!name)throw new Error('Serviço não registrado.');if(!has(process.env[name]))throw new Error('Credencial ausente para '+service+'. Preencha o .env local.');return process.env[name].trim();}
// Não imprimir process.env ou objetos de autenticação. Variáveis do processo têm precedência sobre o arquivo.
