// Editorial matching rules, not a prediction of completion, employability, or admission.
const levelNumber = {beginner:0,intermediate:1,advanced:2};
export function hasRelevantProject(a) { return a.experience === 'project' && a.projectTrack === a.track; }
export function targetLevel(a) {
  if (a.knowledge === 'new') return 0;
  if (a.knowledge === 'some') return hasRelevantProject(a) ? 1 : 0;
  return hasRelevantProject(a) ? 2 : 1;
}
export function yearFor(a) { return a.cohort === 'c2' ? 3 : a.cohort === 'c3' ? 2 : Number(a.year); }
export function recommend(courses, a) {
  const target = targetLevel(a);
  const weekly = Number(a.weeklyHours);
  const limit = Number(a.maxWeeks);
  return courses.filter(c=>c.track === a.track && !(a.completed || []).includes(c.id)).map(c=>{
    const level = levelNumber[c.level];
    const weeks = Math.ceil(c.hours / weekly);
    const needsPreparation = level > target;
    const overTime = limit > 0 && weeks > limit;
    const reasons = ['Matches your chosen field of interest.'];
    const cautions = [];
    if (a.experience === 'project') reasons.push(hasRelevantProject(a) ? 'Your previous Coursera project is in this same domain.' : 'Your previous project was in another domain; subject foundations still guide this recommendation.');
    const components = {interest:30,readiness:0,goal:0,time:0,stage:0};
    components.readiness = level === target ? 30 : level < target ? 23 : level === target+1 ? 10 : 0;
    if (!needsPreparation) reasons.push(level === 0 ? 'A foundation course that fits your current subject knowledge.' : `Its ${c.level} level fits the subject knowledge and project experience you reported.`);
    else cautions.push(`Suggested preparation: strengthen ${target === 0 ? 'the foundations' : 'intermediate skills'} before attempting this ${c.level} course. This is our guidance, not a verified provider prerequisite.`);
    if (a.goal === 'explore') {
      components.goal = (level === 0 ? 10 : 3) + (c.hours <= 40 ? 6 : 1) + (!c.capstone ? 4 : 1);
      if (level === 0) reasons.push('Helps you explore the field before moving into deeper study.');
      if (!c.capstone) reasons.push('A final project is not specified; check the assessment details on Coursera.');
    } else if (a.goal === 'portfolio') {
      components.goal = c.capstone ? 20 : /project|build|hands-on|practical/i.test(c.description) ? 12 : 5;
      if(c.capstone) reasons.push('Includes a final project: a concrete opportunity to build portfolio work.');
    } else if (a.goal === 'skills') {
      components.goal = level === target ? 18 : 12;
      reasons.push('Builds subject-specific skills you can practise alongside college.');
    } else {
      components.goal = c.capstone ? 18 : c.hours <= 40 ? 15 : 12;
      reasons.push(c.capstone ? 'A final project can give you work to discuss in internship or job interviews.' : 'Builds relevant foundations for internship or job preparation.');
    }
    // Previous project completion gives a modest preference to substantial final project work.
    // It never overrides readiness or the learner's chosen introductory goal.
    if(hasRelevantProject(a) && a.goal !== 'explore' && c.capstone && c.hours >= 40) {
      components.goal = Math.min(20,components.goal+3);
      reasons.push('You have completed a Coursera project in this domain, so a longer final project is a useful next option.');
    }
    components.time = overTime ? Math.max(0,15-Math.ceil((weeks-limit)/2)) : 15;
    if(overTime) cautions.push(`About ${weeks} weeks at ${weekly} hours/week, beyond your ${limit}-week preference.`);
    else reasons.push(`About ${weeks} ${weeks === 1 ? 'week' : 'weeks'} at your ${weekly} hours/week${limit ? ', within your time preference' : ''}.`);
    const year = yearFor(a);
    // Year has just 5 points. A third-year beginner stays a beginner.
    components.stage = year <= 2 ? (level === 0 ? 5 : 2) : (a.goal === 'career' || a.goal === 'portfolio') ? (c.capstone ? 5 : 3) : (level === 0 ? 5 : 4);
    if(year <= 2 && level === 0) reasons.push('A foundation-first option for your current college stage.');
    let score = Object.values(components).reduce((x,y)=>x+y,0);
    if(needsPreparation) score = Math.min(score,54);
    if(overTime) score = Math.min(score,69);
    const status = needsPreparation ? 'Build up to this' : overTime ? 'Needs more time' : score >= 85 ? 'Excellent fit' : score >= 70 ? 'Good fit' : 'Worth exploring';
    return {...c,score,stars:Math.max(1,Math.round(score/20)),weeks,reasons,cautions,components,needsPreparation,overTime,status};
  }).sort((a,b)=>Number(a.needsPreparation)-Number(b.needsPreparation) || Number(a.overTime)-Number(b.overTime) || b.score-a.score || a.sequence-b.sequence);
}
export function recommendationsCsv(items) {
  const rows=[['Course','Provider','Track','Level','Relevance score','Hours','Estimated weeks at your pace','Suggested duration','Final project','Why it fits','Considerations','Coursera URL'],...items.map(c=>[c.title,c.provider,c.track,c.level,c.score,c.hours,c.weeks,c.catalogDuration,c.capstone?'Included':'Not specified',c.reasons.join(' '),c.cautions.join(' '),c.url])];
  return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value ?? '').replaceAll('"','""')+'"').join(',')).join('\r\n');
}
