export const tracks = [
  {id:'data-science',name:'Data Science & ML',icon:'brain',description:'Find patterns. Build predictive models.',basics:'Python, basic statistics, and working with datasets'},
  {id:'ai-analytics',name:'AI & Data Analytics',icon:'chart',description:'Turn data into useful decisions.',basics:'Python or SQL, spreadsheets, and basic data analysis'},
  {id:'web-development',name:'Web Development',icon:'code',description:'Bring websites and applications to life.',basics:'HTML, CSS, JavaScript, and basic programming'},
  {id:'finance',name:'Finance',icon:'wallet',description:'Understand money, markets, and businesses.',basics:'Accounting, financial statements, and Excel'},
  {id:'electrical',name:'Electrical Engineering',icon:'zap',description:'Explore circuits, energy, and electric vehicles.',basics:'Circuits, electrical systems, and engineering mathematics'},
  {id:'civil',name:'Civil Engineering',icon:'building',description:'Build a more sustainable world.',basics:'Construction, building systems, and engineering fundamentals'},
  {id:'mechanical',name:'Mechanical Engineering',icon:'settings',description:'Design, model, and understand how things work.',basics:'Mechanics, mathematics, and basic engineering design'},
  {id:'operations',name:'Operations',icon:'workflow',description:'Make projects and processes work better.',basics:'Business processes, planning, and operations concepts'},
  {id:'marketing',name:'Marketing',icon:'megaphone',description:'Connect brands, people, and ideas.',basics:'Marketing channels, audiences, and campaign metrics'},
  {id:'consulting',name:'Consulting',icon:'briefcase',description:'Solve business problems with clarity.',basics:'Business frameworks, problem solving, and spreadsheets'},
];
export const stages = [
  {id:'c3',title:'Cohort 3',detail:'Second year',year:2},
  {id:'c2',title:'Cohort 2',detail:'Third year',year:3},
  {id:'other',title:'Another cohort',detail:'Choose your college year',year:null},
];
export const goals = [
  {id:'explore',title:'Find my starting point',detail:'Understand the basics and build confidence.'},
  {id:'skills',title:'Strengthen my skills',detail:'Go deeper in a subject I care about.'},
  {id:'portfolio',title:'Build something I can show',detail:'Create a practical project for my portfolio.'},
  {id:'career',title:'Prepare for an internship or job',detail:'Build relevant skills for my next opportunity.'},
];
export const initialAnswers = {track:'',knowledge:'',experience:'',projectTrack:'',completed:[],cohort:'',year:'',goal:'',weeklyHours:5,maxWeeks:12};
export const trackById = Object.fromEntries(tracks.map(t=>[t.id,t]));
