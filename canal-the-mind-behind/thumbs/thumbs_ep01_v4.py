# EP01, thumb v4 (05/11/2026): mais contraste e nitidez SÓ na imagem de fundo; sombra atrás do texto igual à versão C.
from thumb_lib import *
def fundo():
    im=base('a1-fachada',zoom=1.15,cx=0.85,cy=0.45,bright=1.3,contrast=1.3,sat=1.2)
    im=im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
    return grad(im,330,640,235)
# F: mesmo texto da C (pedido de Luiz: só mais contraste e nitidez)
im=fundo(); im=texto(im,[('38 PEOPLE',PAPEL),('WATCHED.',PAPEL)],50,40,215); im=caixa(im,'NOBODY HELPED?',55,450,150)
im.save('thumb-ep01-f.jpg',quality=95)
# G: mesma imagem, texto que complementa o título em vez de repeti-lo
im=fundo(); im=texto(im,[('38 PEOPLE',PAPEL),('WATCHED?',PAPEL)],50,40,215); im=caixa(im,'IT WAS A MYTH.',55,450,150)
im.save('thumb-ep01-g.jpg',quality=95)
