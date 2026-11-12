# folha de contato: python3 contato.py saida.jpg img1 img2 ...  (rótulo com o nome)
import sys
from PIL import Image, ImageDraw, ImageFont
out=sys.argv[1]; fs=sys.argv[2:]; W=270; H=480; cols=min(6,len(fs)); rows=(len(fs)+cols-1)//cols
sheet=Image.new('RGB',(cols*W,rows*(H+30)),(20,20,20)); d=ImageDraw.Draw(sheet)
try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',20)
except: font=None
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((W,H)); x=(i%cols)*W; y=(i//cols)*(H+30)
    sheet.paste(im,(x,y)); d.text((x+6,y+H+4),f.split('/')[-1].rsplit('.',1)[0],fill=(230,220,200),font=font)
sheet.save(out,quality=85)
