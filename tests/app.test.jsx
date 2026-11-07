import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:4173'});
for(const key of ['window','document','HTMLElement','Element','HTMLDialogElement','Node','Event','MouseEvent','localStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
window.scrollTo=()=>{};
HTMLElement.prototype.scrollIntoView=()=>{};
HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new Event('close'));};
const React=(await import('react')).default;
const {render,screen,fireEvent,cleanup,within}=await import('@testing-library/react');
const App=(await import('../src/App.jsx')).default;
afterEach(()=>{cleanup();localStorage.clear();});
const click=(name)=>fireEvent.click(screen.getByRole('button',{name}));
const continueStep=()=>click(/^Continue$/);
function selectFinance(){click(/^Finance.*Understand/);continueStep();}
function finishBeginner(){selectFinance();click(/new to this/);click(/No, not yet/);continueStep();click(/Cohort 3.*Second year/);click(/Find my starting point/);continueStep();click(/See my recommendations/);}

test('questionnaire validates missing answers and recommends a foundation course for a C3 beginner',()=>{
 render(<App/>);continueStep();assert.match(screen.getByRole('alert').textContent,/Choose a field/);
 finishBeginner();const rows=screen.getAllByRole('row');assert.match(rows[1].textContent,/Introduction to Financial Accounting/);assert.match(rows[1].textContent,/16 hours/);assert.match(rows[1].textContent,/No final project marked/);assert.match(rows[1].textContent,/1 project entry in PDF/);
 assert.ok(screen.getByText('Cohort 3 · Second year'));
 click(/View details for Introduction to Financial Accounting/);const dlg=screen.getByRole('dialog');assert.match(dlg.textContent,/Why this course appears/);assert.match(dlg.textContent,/page 17/);assert.equal(within(dlg).getByRole('link',{name:/Open on Coursera/}).getAttribute('href'),'https://www.coursera.org/learn/wharton-accounting');click(/Close dialog/);
});
test('previous Coursera project requires a domain and changes third-year recommendations',()=>{
 render(<App/>);selectFinance();click(/confident with the foundations/);click(/Yes, I’ve completed a Coursera project/);continueStep();assert.match(screen.getByRole('alert').textContent,/project domain/);
 fireEvent.change(screen.getByLabelText(/Which domain was that project in/),{target:{value:'finance'}});continueStep();click(/Cohort 2.*Third year/);click(/Build something I can show/);continueStep();click(/I’m flexible/);click(/See my recommendations/);
 const row=screen.getAllByRole('row')[1];assert.match(row.textContent,/Financial Analyst: AI, Excel & Power BI/);assert.match(row.textContent,/advanced/);assert.match(row.textContent,/Final project included/);assert.ok(screen.getByText('Project in this domain'));
 click(/Edit answers/);assert.ok(screen.getByRole('button',{name:/^Finance.*Understand/}).getAttribute('aria-pressed')==='true');
});
test('completed-course picker excludes selections from results',()=>{
 render(<App/>);selectFinance();click(/new to this/);click(/No, not yet/);fireEvent.click(screen.getByText(/Already completed courses from this catalog/));fireEvent.click(screen.getByRole('checkbox',{name:/Introduction to Financial Accounting.*Finance/}));continueStep();click(/Cohort 3.*Second year/);click(/Find my starting point/);continueStep();click(/See my recommendations/);assert.equal(screen.queryByRole('button',{name:'View details for Introduction to Financial Accounting'}),null);
});
test('shortlist saves locally and survives a fresh app render',()=>{
 const first=render(<App/>);finishBeginner();click(/^Save Introduction to Financial Accounting$/);assert.ok(JSON.parse(localStorage.getItem('aspire-shortlist-v1')).includes('finance-1'));click(/My shortlist/);assert.ok(screen.getByRole('button',{name:'Introduction to Financial Accounting'}));
 first.unmount();render(<App/>);click(/My shortlist/);assert.ok(screen.getByRole('button',{name:'Introduction to Financial Accounting'}));click(/^Unsave Introduction to Financial Accounting$/);assert.ok(screen.getByText('A little space for your next step.'));
});
test('catalog searches skills, filters track and level, and recovers from no results',()=>{
 render(<App/>);click(/Explore catalog/);assert.ok(screen.getByText('71 courses'));fireEvent.change(screen.getByRole('textbox',{name:'Search catalog'}),{target:{value:'Power BI'}});assert.ok(screen.getByText('2 courses'));fireEvent.change(screen.getByRole('combobox',{name:'Filter by learning track'}),{target:{value:'finance'}});assert.ok(screen.getByText('1 course'));fireEvent.change(screen.getByRole('combobox',{name:'Filter by level'}),{target:{value:'beginner'}});assert.ok(screen.getByText('No courses match these filters.'));click(/^Clear filters$/);assert.ok(screen.getByText('71 courses'));
});
test('other cohort requires an explicit college year',()=>{
 render(<App/>);selectFinance();click(/new to this/);click(/No, not yet/);continueStep();click(/Another cohort.*Choose/);click(/Find my starting point/);continueStep();assert.ok(screen.getByRole('alert'));fireEvent.change(screen.getByRole('combobox',{name:'Your current college year'}),{target:{value:'1'}});continueStep();assert.ok(screen.getByText('Make room for what’s next.'));
});
test('download plan creates a CSV and announces success',()=>{
 render(<App/>);finishBeginner();let downloaded=false;const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL,oldClick=dom.window.HTMLAnchorElement.prototype.click;
 URL.createObjectURL=blob=>{assert.equal(blob.type,'text/csv;charset=utf-8;');return 'blob:course-plan';};URL.revokeObjectURL=()=>{};dom.window.HTMLAnchorElement.prototype.click=function(){downloaded=this.download==='my-aspire-course-plan.csv';};
 try{click(/Download plan/);assert.ok(downloaded);assert.match(screen.getByRole('status').textContent,/downloaded/);}finally{URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;dom.window.HTMLAnchorElement.prototype.click=oldClick;}
});

test('changing interest asks for knowledge in the new domain again',()=>{
 render(<App/>);finishBeginner();click(/Edit answers/);click(/^Web Development/);continueStep();continueStep();assert.match(screen.getByRole('alert').textContent,/subject knowledge/);assert.equal(screen.getByRole('button',{name:/new to this/}).getAttribute('aria-pressed'),'false');
});
