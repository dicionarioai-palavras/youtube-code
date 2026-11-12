// Mostra, sem segredos: plano e caracteres restantes, vozes da conta, modelos e as últimas gerações.
// Uso (na raiz Redes-sociais): node code/apis-externas/src/elevenlabs-status.mjs
import {loadExternalEnv} from './config.mjs';
import {assinatura, vozes, ultimasGeracoes, modelos} from './elevenlabs.mjs';
loadExternalEnv();
try {
  console.log(JSON.stringify({
    assinatura: await assinatura(),
    vozes_proprias: (await vozes()).filter((v) => v.categoria !== 'premade'),
    modelos: await modelos().catch((e) => 'indisponível: ' + e.message),
    ultimas_geracoes: await ultimasGeracoes(3),
  }, null, 2));
} catch (e) {
  console.log('ERRO', e.message);
  process.exitCode = 1;
}
