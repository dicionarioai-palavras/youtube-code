import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {FONTES} from '../estilo';

// Carrega as fontes da pasta public/fonts antes de renderizar o primeiro quadro.
export const useFontes = () => {
  const [handle] = useState(() => delayRender('carregando fontes'));
  useEffect(() => {
    Promise.all(
      Object.values(FONTES).map(async ({familia, arquivo, peso}) => {
        const f = new FontFace(familia, `url(${staticFile(arquivo)})`, {weight: peso});
        await f.load();
        document.fonts.add(f);
      }),
    )
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};
