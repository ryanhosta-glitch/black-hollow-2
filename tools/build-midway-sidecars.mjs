// Read-only CASA inputs. Outputs are derived route JSON; never rewrite or publish an archive.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {openCasa} from '../casa_game/archive.mjs';
import {buildMidwayForArchive} from '../casa_admin/forge_midway_archive.mjs';
const args=process.argv.slice(2),at=args.indexOf('--out');
if(at<0||!args[at+1])throw Error('Usage: node tools/build-midway-sidecars.mjs --out /tmp/midway-plans house.casa [...]');
const out=path.resolve(args[at+1]),files=args.filter((_,i)=>i!==at&&i!==at+1);if(!files.length||files.length>512)throw Error('Select 1–512 CASA input files');await mkdir(out,{recursive:true});const results=[];
for(const file of files){const input=await readFile(file),house=await openCasa(input),snapshot=JSON.stringify({rooms:house.rooms,access:house.access,decoration:house.decoration}),started=performance.now(),plan=buildMidwayForArchive(house),generationMilliseconds=Math.round(performance.now()-started);if(snapshot!==JSON.stringify({rooms:house.rooms,access:house.access,decoration:house.decoration}))throw Error('Planner mutated navigation: '+file);
 const output=path.join(out,house.fingerprint+'.midway.json');await writeFile(output,JSON.stringify({houseFingerprint:house.fingerprint,plan},null,2),{flag:'wx'});const summary={file:path.basename(file),houseId:house.manifest.id,fingerprint:house.fingerprint,status:plan.status,generationMilliseconds,estimatedSeconds:plan.attraction?.estimatedSeconds,checkedPoints:plan.validation.checkedPoints,vehicle:plan.vehicle?.id,visited:plan.coverage.visited.length,total:plan.coverage.total,excluded:plan.coverage.excluded,meters:plan.validation.routeMeters||0,legs:plan.legs.length,bytes:(await readFile(output)).length,transferLegs:plan.legs.filter(l=>l.kind==='transfer').length,loops:plan.legs.filter(l=>l.maneuver==='turnaround-loop').length,reversalPauses:plan.legs.filter(l=>l.kind==='turn').length,issues:plan.validation.issues};results.push(summary);console.log(summary.file,summary.status,summary.visited+'/'+summary.total);
 if(!input.equals(await readFile(file)))throw Error('Original archive changed during analysis: '+file);
}
await writeFile(path.join(out,'report.json'),JSON.stringify({edition:'haunted-midway-route-1',originalsUnchanged:true,runtimeReady:false,results},null,2),{flag:'wx'});
