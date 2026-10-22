import {spawnSync} from 'node:child_process';
let failed=false;
for(const suite of ['forge','stairs','pipeline','reactions','rooms','organ']){
 const result=spawnSync(process.execPath,['tests/browser-'+suite+'.mjs'],{stdio:'inherit',env:process.env});
 if(result.status!==0)failed=true;
}
process.exitCode=failed?1:0;
