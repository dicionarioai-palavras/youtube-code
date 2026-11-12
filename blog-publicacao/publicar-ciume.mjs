// Publica os 5 artigos do Ciúme (versão antes do vídeo) direto na tabela blog.articles de produção
// (a mesma que o blog antigo e o site novo leem) e sobe as capas no R2. Credenciais do .env do palavras-backend; nunca impressas.
// Uso: node publicar-ciume.mjs [--dry]
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import { createRequire } from 'module';
const HOME=process.env.HOME, BK=path.join(HOME,'mnt/proj/palavras/palavras-backend');
const env=Object.fromEntries(fs.readFileSync(path.join(BK,'.env'),'utf8').split(/\r?\n/).filter(l=>/^[A-Z0-9_]+=/.test(l)).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const postgres=(await import(path.join(BK,'node_modules/.pnpm/postgres@3.4.9/node_modules/postgres/src/index.js'))).default;
const DRY=process.argv.includes('--dry');
const P=path.join(HOME,'mnt/Redes-sociais/canais/palavras/episodios/ep02-ciume/roteiro-blogs');
const AV=path.join(P,'final/antes-do-video'), IMG=path.join(P,'imagem-artigo');
const A=[
 {slug:'ciume-origem-da-palavra',arq:'ciume-blog-pilar',img:'ciume-origem-da-palavra.jpg',featured:true,
  title:'Ciúme: origem da palavra e por que ela é irmã de zelo',
  excerpt:'Ciúme vem do latim zelumen, de zelus, a mesma raiz de zelo. A origem da palavra, o fogo grego zēlos e por que em francês ciúme é persiana.',
  alt:'Rosto de um homem espiando pelas frestas de uma persiana, iluminado por uma pequena chama',
  categories:['Etimologia','Língua Portuguesa','Comportamento'],tags:['ciúme','zelo','etimologia','origem das palavras','origem da palavra ciúme','jalousie'],related:['ciúme','zelo','zeloso','inveja','cuidado','posse']},
 {slug:'ciume-ou-cuidado',arq:'ciume-blog-ciume-ou-cuidado',img:'ciume-ou-cuidado.jpg',featured:false,
  title:'Ciúme ou cuidado? O que cabe num "me passa tua localização"',
  excerpt:'Uma sexta, onze da noite, um "me passa tua localização?". Ciúme e zelo nasceram da mesma palavra, e é por isso que a frase engana tão bem.',
  alt:'Mulher sentada no sofá à noite olhando o celular, com a luz da rua entrando pela persiana',
  categories:['Comportamento','Crônica'],tags:['ciúme','zelo','relacionamento','palavras','ciúme ou cuidado'],related:['ciúme','zelo','cuidado']},
 {slug:'ciume-ou-ciumes',arq:'ciume-blog-ciume-ou-ciumes',img:'ciume-ou-ciumes.jpg',featured:false,
  title:'Ciúme ou ciúmes: qual é o certo?',
  excerpt:'Ciúme ou ciúmes? As duas formas estão certas. Veja a diferença de peso entre o singular e o plural, a concordância e de onde vem a palavra.',
  alt:'As palavras ciúme e ciúmes, a segunda mais leve que a primeira',
  categories:['Dúvidas de Português','Língua Portuguesa'],tags:['ciúme','ciúmes','dúvidas de português','ciúme ou ciúmes'],related:['ciúme','ciúmes']},
 {slug:'capitu-traiu-bentinho',arq:'ciume-blog-capitu-traiu-bentinho',img:'capitu-traiu-bentinho.jpg',featured:false,
  title:'Capitu traiu Bentinho? O que a dúvida revela sobre o ciúme',
  excerpt:'Capitu traiu Bentinho? Por 60 anos a crítica disse que sim, até Helen Caldwell investigar o narrador. O que Dom Casmurro ensina sobre o ciúme.',
  alt:'Escrivaninha antiga com um livro aberto, óculos e retratos, iluminada pela luz que passa pelas venezianas',
  categories:['Literatura','Comportamento'],tags:['ciúme','Dom Casmurro','Machado de Assis','Capitu','Bentinho','Helen Caldwell'],related:['ciúme','casmurro']},
 {slug:'ciume-e-prova-de-amor',arq:'ciume-blog-ciume-e-prova-de-amor',img:'ciume-e-prova-de-amor.jpg',featured:false,
  title:'Ciúme é prova de amor? O que as pesquisas dizem',
  excerpt:'Mais da metade dos brasileiros diz que quem ama sente ciúme, mas só 1 em 10 admite sentir com frequência. O que isso diz sobre a "prova de amor".',
  alt:'Casal no sofá à noite; ela mexe no celular e ele olha de lado para a tela',
  categories:['Comportamento'],tags:['ciúme','amor','comportamento','palavras','ciúme é prova de amor'],related:['ciúme','amor','zelo']},
];
// PUT assinado SigV4 (sem SDK)
const H=(k,d)=>crypto.createHmac('sha256',k).update(d).digest(), SH=d=>crypto.createHash('sha256').update(d).digest('hex');
async function put(bucket,key,body,ct,cc){const host=`${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;const now=new Date();
 const amz=now.toISOString().replace(/[:-]|\.\d{3}/g,''), ds=amz.slice(0,8), ph=SH(body);
 const uri='/'+bucket+'/'+key.split('/').map(encodeURIComponent).join('/');
 const hd={'cache-control':cc,'content-type':ct,host,'x-amz-content-sha256':ph,'x-amz-date':amz};const sk=Object.keys(hd).sort();
 const creq=['PUT',uri,'',sk.map(k=>k+':'+hd[k]).join('\n')+'\n',sk.join(';'),ph].join('\n');
 const scope=`${ds}/auto/s3/aws4_request`, sts=['AWS4-HMAC-SHA256',amz,scope,SH(creq)].join('\n');
 const kS=H(H(H(H('AWS4'+env.R2_SECRET_ACCESS_KEY,ds),'auto'),'s3'),'aws4_request');
 const sig=crypto.createHmac('sha256',kS).update(sts).digest('hex');
 const r=await fetch('https://'+host+uri,{method:'PUT',body,headers:{...hd,authorization:`AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${sk.join(';')}, Signature=${sig}`}});
 if(!r.ok) throw new Error('R2 PUT '+r.status+' '+(await r.text()).slice(0,200));}
async function sobe(f){const buf=fs.readFileSync(f);const h=crypto.createHash('sha256').update(buf).digest('hex').slice(0,16);const d=new Date();
 const key=`blog/${d.getUTCFullYear()}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${h}.jpg`;
 if(!DRY) await put(env.R2_BUCKET_IMG||env.R2_BUCKET||'palavras-img',key,buf,'image/jpeg','public, max-age=31536000, immutable');
 return env.R2_PUBLIC_BASE_URL.replace(/\/$/,'')+'/'+key;}
const sql=postgres(env.DATABASE_URL,{ssl:'require',max:1});
const out=[];
for(const a of A){
 const md=fs.readFileSync(path.join(AV,a.arq+'-antes-do-video.md'),'utf8');
 const ja=await sql`select id from blog.articles where site='palavras' and slug=${a.slug}`;
 if(ja.length){out.push({slug:a.slug,status:'JA EXISTE — pulei'});continue;}
 const capa=await sobe(path.join(IMG,a.img));
 const palavras=md.split(/\s+/).length, rt=Math.max(1,Math.round(palavras/200));
 const row={id:crypto.randomUUID(),site:'palavras',slug:a.slug,title:a.title,excerpt:a.excerpt,seo_title:a.title,meta_description:a.excerpt,content_markdown:md,cover_image_url:capa,cover_alt:a.alt,
  author_slug:'luiz-henrique',author_name:'Luiz Henrique',categories:a.categories,tags:a.tags,related_words:a.related,video_urls:[],status:'published',featured:a.featured,reading_time_minutes:rt,capa_tipografica:true,midia_pendente:false};
 if(!DRY){await sql`insert into blog.articles (id,site,slug,title,excerpt,seo_title,meta_description,content_markdown,cover_image_url,cover_alt,author_slug,author_name,categories,tags,related_words,video_urls,status,featured,reading_time_minutes,capa_tipografica,midia_pendente,published_at,created_at,updated_at)
  values (${row.id},${row.site},${row.slug},${row.title},${row.excerpt},${row.seo_title},${row.meta_description},${row.content_markdown},${row.cover_image_url},${row.cover_alt},${row.author_slug},${row.author_name},${row.categories}::text[],${row.tags}::text[],${row.related_words}::text[],${row.video_urls}::text[],${row.status},${row.featured},${row.reading_time_minutes},${row.capa_tipografica},${row.midia_pendente},now(),now(),now())`;}
 out.push({slug:a.slug,capa,rt,palavras,status:DRY?'dry':'publicado'});
}
console.log(JSON.stringify(out,null,1)); if(!DRY) fs.writeFileSync(path.join(P,'imagem-artigo','publicacao-resultado-ciume.json'),JSON.stringify(out,null,1));
await sql.end();
