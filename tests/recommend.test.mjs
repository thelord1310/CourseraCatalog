import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recommend,targetLevel,recommendationsCsv} from '../src/recommend.mjs';
const courses=JSON.parse(readFileSync(new URL('../src/data/courses.json',import.meta.url),'utf8'));
const base={track:'finance',knowledge:'new',experience:'none',projectTrack:'',completed:[],cohort:'c3',goal:'explore',weeklyHours:5,maxWeeks:12};
test('catalog contains all detailed entries and valid traceable source data',()=>{
 assert.equal(courses.length,71);assert.equal(new Set(courses.map(c=>c.id)).size,71);assert.equal(new Set(courses.map(c=>c.track)).size,10);
 for(const c of courses){assert.ok(c.title&&c.description&&c.skills.length&&c.certificate);assert.ok(c.hours>0);assert.ok(c.sourcePage>=11&&c.sourcePage<=43);assert.equal(new URL(c.url).hostname,'www.coursera.org');assert.equal(c.projectCount,1);assert.ok(['beginner','intermediate','advanced'].includes(c.level));assert.ok(!c.description.includes('SECTION'));}
});
test('second-year beginner gets a short foundation without a marked capstone',()=>{
 const r=recommend(courses,base);assert.equal(r[0].id,'finance-1');assert.equal(r[0].capstone,false);assert.equal(r[0].needsPreparation,false);assert.equal(r[0].weeks,4);
});
test('third-year does not imply intermediate or advanced ability',()=>{
 for(const track of new Set(courses.map(c=>c.track))){const a={...base,cohort:'c2',track,goal:'career',maxWeeks:0};const r=recommend(courses,a);assert.equal(targetLevel(a),0);if(courses.some(c=>c.track===track&&c.level==='beginner'))assert.equal(r[0].level,'beginner');}
});
test('same-domain project materially changes suggested level; other-domain project does not skip foundations',()=>{
 const a={...base,cohort:'c2',knowledge:'some',experience:'project',projectTrack:'finance',goal:'portfolio',maxWeeks:0};assert.equal(targetLevel(a),1);assert.equal(recommend(courses,a)[0].level,'intermediate');
 const cross={...a,projectTrack:'web-development'};assert.equal(targetLevel(cross),0);assert.equal(recommend(courses,cross)[0].level,'beginner');
 assert.equal(targetLevel({...a,knowledge:'confident'}),2);assert.equal(targetLevel({...a,knowledge:'new'}),0);
});
test('relevant experienced scholar sees substantial capstone work before foundation courses',()=>{
 const r=recommend(courses,{...base,cohort:'c2',knowledge:'confident',experience:'project',projectTrack:'finance',goal:'portfolio',maxWeeks:0});assert.equal(r[0].level,'advanced');assert.ok(r[0].capstone);assert.ok(r[0].hours>=40);
});
test('completed courses are excluded, and completing a whole track returns an empty result',()=>{
 assert.ok(!recommend(courses,{...base,completed:['finance-1']}).some(c=>c.id==='finance-1'));
 assert.deepEqual(recommend(courses,{...base,completed:courses.filter(c=>c.track==='finance').map(c=>c.id)}),[]);
});
test('civil beginners receive preparation flags rather than false ready-to-start recommendations',()=>{
 const r=recommend(courses,{...base,track:'civil'});assert.ok(r.every(c=>c.needsPreparation&&c.score<=54&&c.status==='Build up to this'));
});
test('time constraints are respected and flexible schedule removes duration penalties',()=>{
 const r=recommend(courses,{...base,track:'web-development',maxWeeks:4,weeklyHours:3});assert.ok(r.every(c=>c.overTime));assert.ok(r.every(c=>c.score<=69));
 assert.ok(recommend(courses,{...base,maxWeeks:0}).every(c=>!c.overTime));
});
test('all valid profiles produce bounded scores, correct time estimates, and stable readiness-first order',()=>{
 let count=0;for(const track of new Set(courses.map(c=>c.track)))for(const knowledge of ['new','some','confident'])for(const experience of ['none','course','project'])for(const cohort of ['c2','c3'])for(const goal of ['explore','skills','portfolio','career'])for(const weeklyHours of [3,5,8,12])for(const maxWeeks of [4,12,24,0]){
 const a={...base,track,knowledge,experience,projectTrack:track,cohort,goal,weeklyHours,maxWeeks},r=recommend(courses,a);
 for(const c of r){assert.ok(c.score>=0&&c.score<=100);assert.equal(c.weeks,Math.ceil(c.hours/weeklyHours));assert.equal(c.track,track);assert.ok(c.stars>=1&&c.stars<=5);}
 for(let i=1;i<r.length;i++){if(r[i-1].needsPreparation)assert.ok(r[i].needsPreparation);if(r[i-1].needsPreparation===r[i].needsPreparation&&r[i-1].overTime)assert.ok(r[i].overTime);}
 count++;
 }assert.equal(count,11520);
});
test('CSV preserves quotes, commas, links, and the explanation',()=>{
 const r=recommend(courses,base),csv=recommendationsCsv([{...r[0],title:'A "quoted", course'}]);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"A ""quoted"", course"'));assert.ok(csv.includes(r[0].url));assert.ok(csv.includes('Why it fits'));
});
