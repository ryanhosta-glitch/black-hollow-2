import {spawnSync} from 'node:child_process';
let failed=false;
for(const suite of ['midway','midway-scenes','midway-park','atmosphere','storytelling','lighting','heirloom','luxury','playpack','household','nocturne','release-entry','townlife','polish','afterlife','village','magic','playtest-pass','scares','phoenix','forge','stairs','pipeline','reactions','rooms','organ','halloween','town','student-readiness','batch','street-memory','runtime-cleanup','directors-pass','reference']){
 const launcher=process.env.CHROMIUM_PATH?['--import',new URL('./browser-launch.mjs',import.meta.url).href]:[];
 const result=spawnSync(process.execPath,[...launcher,'tests/browser-'+suite+'.mjs'],{stdio:'inherit',env:process.env});
 if(result.status!==0)failed=true;
}
process.exitCode=failed?1:0;
