// Envia as imagens do artigo ao R2 do blog (mesmo esquema de chave do backend: blog/aaaa/mm/<sha256-16>.jpg).
// Credenciais lidas do .env do palavras-blog-backend; nunca impressas. Uso: node enviar-r2.cjs arquivo1.jpg [arquivo2.jpg]
const path=require('path'),fs=require('fs'),crypto=require('crypto');
const B=path.join(process.env.HOME,'mnt/blog-palavras/palavras-blog-backend');
const env={};for(const l of fs.readFileSync(path.join(B,'.env'),'utf8').split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].replace(/^"|"$/g,'');}
const {S3Client,PutObjectCommand}=require(process.env.S3_SDK||path.join(B,'node_modules/@aws-sdk/client-s3'));
const c=new S3Client({region:'auto',endpoint:`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:env.R2_ACCESS_KEY_ID,secretAccessKey:env.R2_SECRET_ACCESS_KEY}});
(async()=>{const out={};for(const f of process.argv.slice(2)){const buf=fs.readFileSync(f);const h=crypto.createHash('sha256').update(buf).digest('hex').slice(0,16);const d=new Date();
const key=`blog/${d.getUTCFullYear()}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${h}.jpg`;
await c.send(new PutObjectCommand({Bucket:env.R2_BUCKET_IMG||'palavras-img',Key:key,Body:buf,ContentType:'image/jpeg',CacheControl:'public, max-age=31536000, immutable'}));
out[path.basename(f)]=env.R2_PUBLIC_BASE_URL.replace(/\/$/,'')+'/'+key;}console.log(JSON.stringify(out));})().catch(e=>{console.error('ERRO',e.name,(e.message||'').slice(0,200));process.exit(1);});
