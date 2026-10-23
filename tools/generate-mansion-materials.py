"""Embed shared damask relief and a stone checker tile; original materials keep their IDs."""
from pathlib import Path
from PIL import Image,ImageOps,ImageEnhance
import json,base64,io
root=Path(__file__).resolve().parents[1]
path=root/'casa_admin/forge_textures.mjs'
tiles=json.loads(path.read_text().split('export const TEXTURES=')[1].rstrip(';\n'))
pattern=Image.open(root/'casa_game/assets/materials/nocturne-damask.webp').convert('L').resize((256,256),Image.Resampling.LANCZOS)
pattern=ImageOps.autocontrast(pattern).point(lambda v:55+int(v*.72)).convert('RGB')
checker=Image.new('RGB',(128,128));pix=checker.load()
for y in range(128):
 for x in range(128):
  light=(x//32+y//32)%2==0
  v=(179 if light else 35)+(x*17+y*13)%7-3
  if x%32<1 or y%32<1:v=67
  pix[x,y]=(v,int(v*.97),int(v*.91))
for name,material,image in [('woven Victorian damask relief',1,pattern),('aged marble checker',26,checker)]:
 output=io.BytesIO();image.save(output,format='PNG',optimize=True)
 tiles=[t for t in tiles if t['material']!=material]
 tiles.append({'name':name,'material':material,'png':base64.b64encode(output.getvalue()).decode()})
path.write_text('// Deterministic PNG tiles embedded into architectural GLBs.\nexport const TEXTURES='+json.dumps(tiles,separators=(',',':'))+';\n')
