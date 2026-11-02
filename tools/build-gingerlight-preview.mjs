// Build the published preview from the same entry and renderer as the studio.
import './build-gingerlight.mjs';
import {readFile,writeFile} from 'node:fs/promises';
let html=await readFile(new URL('../north_pole/gingerlight_student_standalone.html',import.meta.url),'utf8');
html=html.replace('<title>Gingerlight · Student Lighting Studio</title>','<title>Gingerlight · Light Lab 3 · Student Preview</title><meta name="gingerlight-preview-build" content="light-lab-3">');
await writeFile(new URL('../north_pole/student_preview.html',import.meta.url),html);
console.log('Student preview built from current source: light-lab-3.');
