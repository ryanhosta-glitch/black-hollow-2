import {spawnSync} from 'node:child_process';
let failed=false;
for(const suite of ['luxury','playpack','household','nocturne','release-entry','townlife','polish','afterlife','village','magic','playtest-pass','scares','phoenix','forge','stairs','pipeline','reactions','rooms','organ','halloween','town','student-readiness','batch','street-memory','runtime-cleanup','directors-pass','reference']){
 const result=spawnSync(process.execPath,['tests/browser-'+suite+'.mjs'],{stdio:'inherit',env:process.env});
 if(result.status!==0)failed=true;
}
process.exitCode=failed?1:0;
