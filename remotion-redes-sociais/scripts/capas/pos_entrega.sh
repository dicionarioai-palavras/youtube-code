# LEGADO (18/10/2026): caminhos do ambiente de nuvem do Claude. Fluxo atual: scripts/entregar.mjs + remix-adobe.mjs + fim-por-marca.mjs.
set -e
F=/tmp/claude-0/remotion-poc/out/final; E=/tmp/th/entrega; mkdir -p $E
ln_(){ echo "loudnorm=I=-14:TP=-1.5:LRA=11"; }
mk(){ # $1 video-base  $2 audio (vazio=do próprio vídeo)  $3 saída
  local v=$F/$1.mp4; local sz=$(stat -c %s $v)
  local venc="-c:v copy"; [ $sz -gt 27000000 ] && venc="-c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p"
  if [ -z "$2" ]; then ffmpeg -v error -y -i $v -af "$(ln_)" -ar 48000 $venc -c:a aac -b:a 192k -movflags +faststart $3
  else ffmpeg -v error -y -i $v -i $2 -map 0:v -map 1:a -af "$(ln_)" -ar 48000 $venc -c:a aac -b:a 192k -shortest -movflags +faststart $3; fi
  echo "$3 $(stat -c %s $3)"
}
mkdir -p $E/botao-da-foto $E/botao-da-foto-pb $E/frase-escolhida $E/montagem-bastidores-inveja
mk 01-botao-da-foto "" $E/botao-da-foto/final-luiz.mp4
mk 01-botao-da-foto-pb "" $E/botao-da-foto-pb/final-luiz.mp4
mk 01-botao-da-foto-pb $F/01-botao-da-foto-pb.sem-trilha.wav $E/botao-da-foto-pb/final-luiz-sem-trilha.mp4
mk 01-frase-escolhida "" $E/frase-escolhida/final-palavras.mp4
mk 01-frase-escolhida $F/01-frase-escolhida.sem-trilha.wav $E/frase-escolhida/final-palavras-sem-trilha.mp4
mk montagem-bastidores-inveja "" $E/montagem-bastidores-inveja/final-palavras.mp4
mk montagem-bastidores-inveja $F/montagem-bastidores-inveja.sem-trilha.wav $E/montagem-bastidores-inveja/final-palavras-sem-trilha.mp4
mk montagem-bastidores-inveja-luiz "" $E/montagem-bastidores-inveja/final-luiz.mp4
mk montagem-bastidores-inveja-luiz $F/montagem-bastidores-inveja.sem-trilha.wav $E/montagem-bastidores-inveja/final-luiz-sem-trilha.mp4
cp $F/01-botao-da-foto.voz.wav $E/botao-da-foto/voz.wav
cp $F/01-frase-escolhida.voz.wav $E/frase-escolhida/voz.wav
cp $F/montagem-bastidores-inveja.voz.wav $E/montagem-bastidores-inveja/voz.wav
C=/tmp/th/capas
cp $C/botao-da-foto__luiz.png $E/botao-da-foto/capa-luiz.png
cp $C/botao-da-foto-pb__luiz.png $E/botao-da-foto-pb/capa-luiz.png
cp $C/frase-escolhida__palavras.png $E/frase-escolhida/capa-palavras.png
cp $C/montagem-bastidores-inveja__palavras.png $E/montagem-bastidores-inveja/capa-palavras.png
cp $C/montagem-bastidores-inveja__luiz.png $E/montagem-bastidores-inveja/capa-luiz.png
echo POS-OK
