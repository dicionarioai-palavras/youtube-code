// Teste pontual (05/11/2026): a voz clonada falando em português o texto do Short S1 do EP01,
// para Luiz comparar com a dublagem automática do YouTube. Uso: node teste-voz-pt.mjs <saida.mp3>
import fs from 'node:fs';
import {loadExternalEnv} from '../apis-externas/src/config.mjs';
import {assinatura, vozes, falar} from '../apis-externas/src/elevenlabs.mjs';
loadExternalEnv();
const cfg = JSON.parse(fs.readFileSync(new URL('./voz-config.json', import.meta.url), 'utf8'));
const texto = `São três da manhã. Você está dormindo. E então, um som vindo da rua. Uma voz de mulher. Talvez um grito. Talvez alguém bêbado, rindo no caminho de casa. Você fica deitado por um segundo, decidindo.

Agora imagine que trinta e sete vizinhos seus estão deitados nesse mesmo segundo, tomando a mesma decisão. E todos eles decidem voltar a dormir.

Essa é a história que o mundo ouviu sobre a noite em que Kitty Genovese foi morta em Nova York. Trinta e oito pessoas a ouviram. Trinta e oito pessoas não fizeram nada. Virou um dos fatos mais famosos de toda a psicologia. Está nos livros didáticos. É ensinado em academias de polícia. Deu origem a um campo inteiro de pesquisa.

Só tem um problema. Não é verdade. E a história real diz algo sobre você que é muito mais útil do que "as pessoas são covardes".`;
const conta = await assinatura();
console.log('caracteres:', texto.length, '· restantes:', conta.restantes);
const voz = (await vozes()).find((v) => v.nome === cfg.voz_nome);
const r = await falar({voiceId: voz.voice_id, texto, modelId: cfg.modelo, estabilidade: cfg.estabilidade, similaridade: cfg.similaridade, estilo: cfg.estilo, formato: cfg.formato});
fs.writeFileSync(process.argv[2], r.buffer);
console.log('OK', process.argv[2]);
