"""Regenerate the four Pass 2 procedural tiles; keeps the original six tiles. Requires Pillow."""
from pathlib import Path
from PIL import Image
import base64, io, json, math, random
path=Path(__file__).resolve().parents[1]/'casa_admin/forge_textures.mjs'
text=path.read_text();tiles=json.loads(text.split('export const TEXTURES=')[1].rstrip(';\n'))
tiles=[t for t in tiles if t['material']<11 or t['material']>16]
for name,material in [('laboratory ceramic',12),('herringbone parquet',14),('crypt masonry',15),('encaustic tile',16)]:
 image=Image.new('RGB',(128,128));pixels=image.load();rng=random.Random(material)
 for y in range(128):
  for x in range(128):
   noise=rng.randrange(-3,4)
   if material==12:
    grout=x%32<2 or y%32<2;base=(180,182,165) if not grout else (82,91,84);shade=0
   elif material==14:
    # Alternating diagonal wood strips with end grain and thin dark joints.
    u=(x+y)%128;v=(x-y)%128;horizontal=(u//32+v//32)%2==0;grain=math.sin((v if horizontal else u)*1.5)*5
    seam=u%32<2 or v%32<2;base=(128,83,45) if horizontal else (103,62,34);shade=-40 if seam else grain
   elif material==15:
    seam=y%32<2 or (x+(y//32%2)*32)%64<2;base=(92,98,90);shade=-36 if seam else math.sin(x*.14)*3
   else:
    diamond=abs(x%64-32)+abs(y%64-32)<21;seam=x%64<2 or y%64<2;base=(52,91,79) if diamond else (169,161,130);shade=-32 if seam else 0
   pixels[x,y]=tuple(max(0,min(255,int(c+shade+noise))) for c in base)
 buffer=io.BytesIO();image.save(buffer,format='PNG',optimize=True);tiles.append({'name':name,'material':material,'png':base64.b64encode(buffer.getvalue()).decode()})
path.write_text('// Deterministic PNG tiles embedded into architectural GLBs.\nexport const TEXTURES='+json.dumps(tiles,separators=(',',':'))+';\n')
