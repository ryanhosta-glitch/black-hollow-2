"""Regenerate neutral brick and stucco textures without changing existing tiles."""
from pathlib import Path
from PIL import Image
import base64, io, json, random
path=Path(__file__).resolve().parents[1]/'casa_admin/forge_textures.mjs'
tiles=json.loads(path.read_text().split('export const TEXTURES=')[1].rstrip(';\n'))
tiles=[t for t in tiles if t['material'] not in (17,18)]
for material,name in [(17,'neutral running-bond brick'),(18,'neutral rough stucco')]:
    image=Image.new('RGB',(128,128));rng=random.Random(material)
    for y in range(128):
        for x in range(128):
            if material==17:
                seam=y%32<2 or (x+(y//32%2)*32)%64<2
                v=(115 if seam else 222)+rng.randrange(-9,10)
            else:
                v=225+rng.randrange(-20,21)
            image.putpixel((x,y),(v,v,v))
    buffer=io.BytesIO();image.save(buffer,format='PNG',optimize=True)
    tiles.append({'name':name,'material':material,'png':base64.b64encode(buffer.getvalue()).decode()})
path.write_text('// Deterministic PNG tiles embedded into architectural GLBs.\nexport const TEXTURES='+json.dumps(tiles,separators=(',',':'))+';\n')
