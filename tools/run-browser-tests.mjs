import {spawnSync} from 'node:child_process';
let failed=false;
for(const suite of ['phoenix','forge','stairs','pipeline','reactions','rooms','organ','halloween','town','student-readiness','batch','street-memory']){
 const result=spawnSync(process.execPath,['tests/browser-'+suite+'.mjs'],{stdio:'inherit',env:process.env});
 if(result.status!==0)failed=true;
}
process.exitCode=failed?1:0;
