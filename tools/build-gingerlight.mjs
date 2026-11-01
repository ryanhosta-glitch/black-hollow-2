import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const entry=new URL('../north_pole/studio.mjs',import.meta.url).pathname;
const result=await build({entryPoints:[entry],bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true,write:false,legalComments:'inline'});
const html=(await readFile(new URL('../north_pole/forge.html',import.meta.url),'utf8')).replace('<a href="gingerlight_studio_standalone.html" download>Download standalone HTML</a>','<span class="note">Standalone edition · all code included</span>');
const output=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('<script type="module" src="studio.mjs"></script>',()=>'<script>'+result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>');
if(/<script[^>]*\bsrc=|<link[^>]*\bhref=/i.test(output))throw Error('Standalone build still has an external script or stylesheet.');
await writeFile(new URL('../north_pole/gingerlight_studio_standalone.html',import.meta.url),output);
console.log('Standalone Christmas Forge/viewer built:',Buffer.byteLength(output),'bytes.');

const student=await build({entryPoints:[new URL('../north_pole/student.mjs',import.meta.url).pathname],bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true,write:false,legalComments:'inline'});
let studentHtml=await readFile(new URL('../north_pole/student.html',import.meta.url),'utf8');
const saveEndpoint=process.env.GINGERLIGHT_SAVE_SERVICE_URL;
if(saveEndpoint){const url=new URL(saveEndpoint);if(url.protocol!=='https:')throw Error('Hosted classroom saves require an HTTPS endpoint.');studentHtml=studentHtml.replace('<meta name="gingerlight-save-service" content="">','<meta name="gingerlight-save-service" content="'+url.href.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">');}
studentHtml=studentHtml.replace('<link rel="stylesheet" href="studio_shell.css">','<style>'+await readFile(new URL('../north_pole/studio_shell.css',import.meta.url),'utf8')+'</style>');
const portable=studentHtml.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('<script type="module" src="student.mjs"></script>',()=>'<script>'+student.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>');
if(/<script[^>]*\bsrc=|<link[^>]*\bhref=/i.test(portable))throw Error('Student build has external code.');
await writeFile(new URL('../north_pole/gingerlight_student_standalone.html',import.meta.url),portable);
console.log('Standalone student editor built:',Buffer.byteLength(portable),'bytes.');
