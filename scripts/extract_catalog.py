import json, re, sys
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from pypdf import PdfReader
if len(sys.argv) < 2:
    raise SystemExit('Usage: python scripts/extract_catalog.py path/to/catalog.pdf')
source = Path(sys.argv[1])
r = PdfReader(source)
track_ids = ['data-science','ai-analytics','web-development','finance','electrical','civil','mechanical','operations','marketing','consulting']
header = re.compile(r'(?:Project|Course)\s+(\d+)\s*[●]?\s*(BEGINNER|INTERMEDIATE|ADVANCED)\s*\|\s*([^\n]+)\n')
joined=''; offsets=[]; links=[]
for i in range(10,43):
    offsets.append((len(joined),i+1)); joined+=r.pages[i].extract_text()+'\n'
    uris=[]
    for ref in r.pages[i].get('/Annots',[]):
        uri=ref.get_object().get('/A',{}).get('/URI')
        if uri and '/partners/' not in uri and uri not in uris: uris.append(uri)
    links.extend(uris)
matches=list(header.finditer(joined))
assert len(matches)==len(links)==71,(len(matches),len(links))
capstones=[{1,2},{1,3,4,5},{1,2},{2,3,4,6,7,8},{2,5,7,8,9},{1,2,3,4,5},{5,6,10,11},{2,4,5,6,10},{1,4,5,6},{1,2,3,4,7}]
track=-1; courses=[]
for i,m in enumerate(matches):
    number=int(m[1])
    if number==1: track+=1
    block=joined[m.end():matches[i+1].start() if i+1<len(matches) else len(joined)]
    block=re.split(r'\bSECTION\s+\d+',block)[0]
    lines=[re.sub(r'\s+',' ',s).strip() for s in block.splitlines() if s.strip()]
    title=lines[0]; flat=re.sub(r'\s+',' ',block).strip()
    duration=re.search(r'Duration\s+([\d.]+)\s+(Weeks?|Hours?)',block,re.I)
    url=urlsplit(links[i]); url=urlunsplit((url.scheme,url.netloc,url.path,'source=search' if '/programs/' in url.path else '', ''))
    courses.append(dict(id=f'{track_ids[track]}-{number}',track=track_ids[track],sequence=number,title=title,provider=re.sub(r'\s+',' ',m[3]).strip(),level=m[2].lower(),description=re.split(r'\bDuration\b',flat)[0][len(title):].strip(),hours=float(re.search(r'Total\s+Hours\s+([\d.]+)',block)[1]),catalogDuration=f'{duration[1]} {duration[2].lower()}',skills=[re.sub(r'\s+',' ',s).strip() for s in re.split(r'Skills\s+Gained\s*:',block)[1].splitlines() if s.strip()],certificate=re.search(r'Certificate:\s*(.*?)\s*Skills\s+Gained:',flat)[1],url=url,sourcePage=max(p for off,p in offsets if off<=m.start()),capstone=number in capstones[track],projectCount=1,projectCountBasis='One project entry in the PDF track summary (pp. 45-47); not a count of course assignments.'))
Path('src/data').mkdir(parents=True,exist_ok=True)
Path('src/data/courses.json').write_text(json.dumps(courses,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('Extracted',len(courses),'course/project entries')
for t in track_ids:
    items=[c for c in courses if c['track']==t]
    print(t,len(items),sum(c['hours'] for c in items))
