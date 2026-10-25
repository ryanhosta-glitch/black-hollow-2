"""Generate only the shared Carrara-style tile; never rebuild houses or other textures."""
from pathlib import Path
from PIL import Image
import base64
import io
import json
import math
import random
rng = random.Random(2502)
size = 128
image = Image.new('RGB', (size, size))
for y in range(size):
    for x in range(size):
        # Tileable diagonal veins, with fine branching and a quiet limestone cloud.
        phase = (x + y * 2 + 7 * math.sin(y * math.tau / size)) * math.tau / size
        distance = abs(math.sin(phase))
        vein = math.exp(-distance * 62) * 46 + math.exp(-distance * 18) * 9
        branch = math.exp(-abs(math.sin(phase * 2 + math.sin(x * math.tau / size))) * 95) * 11
        cloud = math.sin(x * math.tau / size) * math.cos(y * math.tau / size) * 3
        shade = cloud - vein - branch + rng.uniform(-1.5, 1.5)
        image.putpixel((x, y), tuple(max(0, min(255, round(c + shade))) for c in (222, 221, 215)))
buffer = io.BytesIO()
image.save(buffer, format='PNG', optimize=True)
texture = {'name': 'Carrara fireplace marble', 'material': 30, 'png': base64.b64encode(buffer.getvalue()).decode()}
target = Path(__file__).resolve().parents[1] / 'casa_admin/forge_architectural_materials.mjs'
target.write_text('// Reproduce with tools/generate-forge-marble.py. Embedded only where referenced.\nexport const ARCHITECTURAL_TEXTURES=' + json.dumps([texture], separators=(',', ':')) + ';\n')
print('Marble tile PNG:', len(buffer.getvalue()), 'bytes; decoded RGB:', size * size * 3, 'bytes')
