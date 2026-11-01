export const FOUNDATION_IDS=['choose-house','rgb-node','mirrored-patch','independent-patch','half-measure','yard-models','tree-phase','coordinate-animation','save-reopen','fraction-whole','fraction-product','fraction-add','fraction-subtract','fraction-scale','fraction-sharing','whole-divide-unit','unit-divide-whole','decimal-output','phrase-arrival'];
export function validateLearning(progress){
 if(progress===undefined)return;
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v),text=(v,n)=>typeof v==='string'&&v.length<=n;
 if(!object(progress)||progress.version!==1||!FOUNDATION_IDS.includes(progress.activeLesson)||!object(progress.lessons)||Object.keys(progress.lessons).length>FOUNDATION_IDS.length||!object(progress.events)||Object.keys(progress.events).length>10)throw Error('Invalid saved lesson progress.');
 for(const [event,count]of Object.entries(progress.events))if(!['project-download-requested','project-reopened'].includes(event)||!Number.isSafeInteger(count)||count<0||count>1000000)throw Error('Invalid saved lesson event.');
 for(const [id,r]of Object.entries(progress.lessons))if(!FOUNDATION_IDS.includes(id)||!object(r)||!['in-progress','guided-complete'].includes(r.status)||typeof r.answerCorrect!=='boolean'||typeof r.applicationChecked!=='boolean'||!text(r.prediction,1000)||!text(r.reflection,2000)||!Array.isArray(r.attempts)||r.attempts.length>12||r.attempts.some(a=>!object(a)||!text(a.answer,80)||typeof a.correct!=='boolean')||(r.evidence!==undefined&&JSON.stringify(r.evidence).length>1024*1024))throw Error('Invalid saved lesson record.');
}
