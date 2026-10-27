// Build an isolated static preview. Never rebuild houses or write to source files.
import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const destination=process.argv[2];
if(!destination)throw Error('Usage: node tools/build-midway-preview.mjs /path/to/NEW-directory');
const out=resolve(destination),inside=relative(root,out);
if(!inside||(!inside.startsWith(`..${sep}`)&&inside!=='..'))throw Error('Preview output must be outside the source checkout.');
const originals=JSON.parse(await readFile(new URL('../docs/evidence/forge-integration/protected-originals.json',import.meta.url),'utf8'));
async function verify(){for(const [file,expected] of Object.entries(originals)){
 const digest=createHash('sha256').update(await readFile(resolve(root,file))).digest('hex');
 if(digest!==expected)throw Error(`Protected original changed: ${file}`);
}}
await verify();
// Exclusive directory creation intentionally rejects existing destinations.
await mkdir(out,{recursive:false});
for(const dir of ['casa_game','casa_admin'])await cp(resolve(root,dir),resolve(out,dir),{recursive:true,errorOnExist:true,force:false});
let html=await readFile(resolve(root,'casa_game.html'),'utf8');
html=html.replace('<title>','<title>Beta Preview · ').replace('<div class="welcome-copy">','<div class="welcome-copy"><p role="note" style="border:1px solid #c9b27d;padding:10px;color:#f5e6c8">BETA PREVIEW — A separate test copy of Black Hollow. Select The Haunted Midway below. Rides and performance are still being refined.</p>');
if(!html.includes('BETA PREVIEW'))throw Error('Preview notice injection failed');
await writeFile(resolve(out,'index.html'),html);
await writeFile(resolve(out,'casa_game.html'),html);
await writeFile(resolve(out,'.nojekyll'),'');
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
await writeFile(resolve(out,'preview-build.json'),JSON.stringify({kind:'isolated-midway-beta',commit,protectedFiles:Object.keys(originals).length,sourceArchivesUnchanged:true},null,2)+'\n');
await writeFile(resolve(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
await verify();
console.log(`Preview ready: ${out}\nSource commit: ${commit}\nProtected originals verified: ${Object.keys(originals).length}\nNo archive rebuild, catalog rewrite, or deployment performed.`);
