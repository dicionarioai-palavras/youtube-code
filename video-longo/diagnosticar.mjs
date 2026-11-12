import {loadExternalEnv} from '../apis-externas/src/config.mjs';
loadExternalEnv();
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const arg=process.argv[2];
if(!arg)throw Error('Informe o caminho da configuração do tema relativo à raiz do projeto.');
function inside(p){const abs=path.resolve(root,p);const rel=path.relative(root,abs);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Caminho fora do projeto');return abs;}
function read(p){return JSON.parse(fs.readFileSync(inside(p),'utf8'));}
const cfg=read(arg),shared=read(cfg.shared_profile),manifest=read(cfg.manifest);
const blocked=[];
const style=cfg.style_choice||shared.direction.style.selected;
const reference=cfg.style_reference||shared.direction.style.approved_reference;
if(!shared.direction.style.mode)blocked.push('Registrar estratégia de direção por vídeo.');
if(cfg.require_style_reference===true&&(!reference||!fs.existsSync(inside(reference))))blocked.push('Salvar a referência requerida pelo lote específico.');
if(!cfg.image_model||!cfg.video_model)blocked.push('Selecionar modelos após definir requisitos do piloto.');
if(!(Number.isFinite(cfg.budget_usd)&&cfg.budget_usd>0)||cfg.spend_authorized!==true)blocked.push('Definir teto e autorização de gasto do piloto.');
const keys={runway:!!process.env[shared.credentials.runway_env],unsplash:!!process.env.UNSPLASH_ACCESS_KEY,pixabay:!!process.env.PIXABAY_API_KEY};
if(!keys.runway)blocked.push('Configurar credencial Runway por variável de ambiente.');
if(!keys.pixabay)blocked.push('Banco de vídeos pendente: configurar e testar Pixabay ou registrar coleta manual; Unsplash não substitui vídeo.');
const checks={scenes:manifest.scenes.length,manifest_validated:manifest.validation.ok===true,audio_exists:fs.existsSync(inside(manifest.audio.file)),audio_queue_exists:fs.existsSync(inside(cfg.audio_queue)),credential_present:keys};
if(!checks.manifest_validated||!checks.audio_exists||!checks.audio_queue_exists)blocked.push('Resolver entrada local ausente ou manifesto inválido.');
const report={theme:cfg.theme,checked_at:new Date().toISOString(),mode:'diagnostico-local-sem-rede',checks,blocked,can_generate_paid:blocked.length===0,execution_implemented:false,note:'Somente diagnóstico. Mesmo com configuração completa, este programa não gera, baixa ou cobra. Não imprime segredos.',camera_ready:!!cfg.camera_file&&fs.existsSync(inside(cfg.camera_file))&&!!cfg.camera_trim};
const dest=path.join(path.dirname(inside(arg)),'diagnostico-configuracao.json');
fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
