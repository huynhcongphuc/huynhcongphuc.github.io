import json
import os
import re
import sys
from datetime import datetime, timezone, timedelta
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

OUT_PATH='data/tech-news.json'
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; HuynhCongPhucPowerNews/2.1; +https://huynhcongphuc.github.io/news.html)','Accept-Language':'vi,en-US;q=0.9,en;q=0.8'}
TIMEOUT=20
MAX_AGE_DAYS=92

INTERNATIONAL=[
 {'name':'IEEE Spectrum','url':'https://spectrum.ieee.org/type/news/','host':'spectrum.ieee.org','icon':'radio-tower','region':'international'},
 {'name':'CNN Tech','url':'https://edition.cnn.com/business/tech','host':'edition.cnn.com','icon':'cpu','region':'international'},
]
VIETNAM=[
 {'name':'EVN','url':'https://www.evn.com.vn/','host':'www.evn.com.vn','icon':'zap','region':'vietnam'},
 {'name':'EVNHCMC','url':'https://www.evnhcmc.vn/','host':'www.evnhcmc.vn','icon':'zap','region':'vietnam'},
 {'name':'Bộ Công Thương','url':'https://moit.gov.vn/','host':'moit.gov.vn','icon':'landmark','region':'vietnam'},
 {'name':'Tạp chí Năng lượng Việt Nam','url':'https://nangluongvietnam.vn/','host':'nangluongvietnam.vn','icon':'network','region':'vietnam'},
 {'name':'ICON','url':'https://icon.com.vn/','host':'icon.com.vn','icon':'newspaper','region':'vietnam'},
]
POWER_TERMS={'scada':12,'scada/ems':15,'scada/dms':15,'derms':18,'distributed energy resource':15,'distributed energy resources':15,'nguồn năng lượng phân tán':15,'nguồn điện phân tán':15,'nguồn phân tán':12,'hệ thống điện':8,'power system':8,'power grid':9,'electric grid':9,'electrical grid':9,'smart grid':10,'lưới điện':8,'lưới điện thông minh':12,'distribution grid':9,'transmission grid':9,'grid control':10,'grid automation':12,'grid modernization':9,'substation':8,'trạm biến áp':8,'điều độ':9,'dispatch':7,'ems':7,'dms':7,'microgrid':9,'vpp':9,'virtual power plant':10,'renewable integration':8,'năng lượng tái tạo':5,'energy storage':5,'battery storage':5,'bess':8,'flisr':12,'agc':9,'distribution automation':10,'tự động hóa lưới điện':12,'điều khiển lưới':10,'điều khiển hệ thống điện':12,'vận hành hệ thống điện':10,'smart substation':10,'digital substation':10,'relay protection':7,'bảo vệ rơle':7,'iec 61850':12,'iec 60870':12,'ieee 2030.5':15,'ieee 2030.11':15}
EXCLUDE_TERMS=('smartphone','phone','gaming','game ','social media','tiktok','meta ','apple ','iphone','streaming','celebrity','film ','movie','crypto','bitcoin')

# Seeds are fallback only; the 3-month freshness gate below applies to them too.
VIETNAM_SEEDS=[
 {'title':'Công ty Điện lực Quảng Ninh: Đẩy mạnh chuyển đổi số và hiện đại hóa lưới điện 110kV','summary':'Hiện đại hóa lưới điện 110 kV, trạm không người trực và giám sát, điều khiển từ xa qua SCADA/DMS.','url':'https://www.evn.com.vn/d/vi-VN/news/Cong-ty-Dien-luc-Quang-Ninh-Day-manh-chuyen-doi-so-va-hien-dai-hoa-luoi-dien-110kV--60-3557-508638','source':'EVN','published':'2026-06-23T08:47:00+00:00'},
 {'title':'CHINT giới thiệu hệ sinh thái giải pháp lưới điện thông minh, mở rộng hợp tác kỹ thuật với EVNNPC','summary':'Giải pháp tự động hóa, kết nối dữ liệu, giám sát và điều khiển lưới điện thông minh.','url':'https://nangluongvietnam.vn/chint-gioi-thieu-he-sinh-thai-giai-phap-luoi-dien-thong-minh-mo-rong-hop-tac-ky-thuat-voi-evnnpc-36533.html','source':'Tạp chí Năng lượng Việt Nam','published':'2026-08-20T01:29:00+00:00'},
]

def clean(v): return re.sub(r'\s+',' ',v or '').strip()
def absolute(base,href): return urljoin(base,(href or '').split('#',1)[0])
def meta(soup,*names):
 for name in names:
  n=soup.find('meta',attrs={'property':name}) or soup.find('meta',attrs={'name':name})
  if n and n.get('content'): return clean(n['content'])
 return ''
def parse_date(v):
 if not v:return None
 try:return datetime.fromisoformat(v.strip().replace('Z','+00:00'))
 except:pass
 m=re.search(r'(20\d{2})[-/](\d{1,2})[-/](\d{1,2})',v)
 if m:
  try:return datetime(int(m[1]),int(m[2]),int(m[3]),tzinfo=timezone.utc)
  except:return None
 return None
def is_fresh(dt):
 if not dt:return False
 if dt.tzinfo is None:dt=dt.replace(tzinfo=timezone.utc)
 return dt >= datetime.now(timezone.utc)-timedelta(days=MAX_AGE_DAYS)
def relevance(title,summary):
 text=f' {title} {summary} '.lower()
 if any(x in text for x in EXCLUDE_TERMS):return 0
 return sum(w for term,w in POWER_TERMS.items() if term in text)
def tags(title,summary):
 t=f'{title} {summary}'.lower();out=[]
 if any(x in t for x in ('scada','ems','dms','flisr','agc','điều độ')):out.append('scada')
 if any(x in t for x in ('derms','distributed energy','nguồn phân tán','nguồn điện phân tán','vpp','microgrid','ieee 2030')):out.append('derms')
 if any(x in t for x in ('grid','lưới điện','hệ thống điện','substation','trạm biến áp','power system')):out.append('power')
 return out or ['power']
def article_info(source,url):
 r=requests.get(url,headers=HEADERS,timeout=TIMEOUT);r.raise_for_status();soup=BeautifulSoup(r.text,'html.parser')
 title=meta(soup,'og:title','twitter:title') or (clean(soup.title.get_text(' ',strip=True)) if soup.title else '')
 summary=meta(soup,'og:description','description','twitter:description');image=meta(soup,'og:image','twitter:image')
 raw=meta(soup,'article:published_time','date','datePublished','pubdate');dt=parse_date(raw)
 if not dt:
  tn=soup.find('time');dt=parse_date((tn.get('datetime') or clean(tn.get_text(' ',strip=True))) if tn else '')
 score=relevance(title,summary)
 if len(title)<10 or score<8 or not is_fresh(dt):return None
 return {'title':title[:220],'summary':summary[:420],'url':url,'image':image,'source':source['name'],'source_url':source['url'],'published':dt.isoformat(),'published_label':dt.strftime('%d/%m/%Y'),'tags':tags(title,summary),'icon':source['icon'],'region':source['region'],'score':score}
def crawl(source,limit=100):
 try:
  r=requests.get(source['url'],headers=HEADERS,timeout=TIMEOUT);r.raise_for_status();soup=BeautifulSoup(r.text,'html.parser');urls=[];seen=set()
  for a in soup.find_all('a',href=True):
   u=absolute(source['url'],a['href']);p=urlparse(u)
   if p.netloc!=source['host'] or u in seen:continue
   path=p.path.lower()
   if len(path)<8 or any(x in path for x in ('/search','/tag/','/topic/','/author/','/privacy','/contact')):continue
   if source['name']=='CNN Tech' and '/tech/' not in path:continue
   seen.add(u);urls.append(u)
   if len(urls)>=limit:break
  items=[]
  for u in urls:
   try:
    x=article_info(source,u)
    if x:items.append(x)
   except Exception as e:print(f'[{source["name"]}] {u}: {e}',file=sys.stderr)
  items.sort(key=lambda x:(x['published'],x['score']),reverse=True)
  return items,True
 except Exception as e:
  print(f'[{source["name"]}] source failed: {e}',file=sys.stderr);return [],False
def seed_items():
 out=[]
 for x in VIETNAM_SEEDS:
  dt=parse_date(x['published'])
  if not is_fresh(dt):continue
  y=dict(x);y.update({'image':'','source_url':x['url'],'published_label':dt.strftime('%d/%m/%Y'),'tags':tags(x['title'],x['summary']),'icon':'zap','region':'vietnam','score':relevance(x['title'],x['summary'])});out.append(y)
 return out
def unique_rank(items,n):
 seen=set();out=[]
 for x in sorted(items,key=lambda z:(z.get('published',''),z.get('score',0)),reverse=True):
  dt=parse_date(x.get('published',''))
  if not is_fresh(dt):continue
  key=x['url'].split('?')[0]
  if key in seen:continue
  seen.add(key);out.append(x)
  if len(out)>=n:break
 return out
def main():
 status={};international=[];vietnam=[]
 for s in INTERNATIONAL:
  xs,ok=crawl(s);international+=xs;status[s['name']]={'ok':ok,'available':len(xs),'url':s['url']}
 for s in VIETNAM:
  xs,ok=crawl(s);vietnam+=xs;status[s['name']]={'ok':ok,'available':len(xs),'url':s['url']}
 vietnam+=seed_items()
 intl=unique_rank(international,10);vn=unique_rank(vietnam,10)
 items=intl+vn
 # Never resurrect stale previous data. If fewer than 20 fresh relevant articles exist, publish fewer.
 if not items:raise RuntimeError('No relevant technology news newer than 3 months was found.')
 payload={'updated_at':datetime.now(timezone.utc).isoformat(),'mode':f'{len(intl)} international + {len(vn)} Vietnam | max age 3 months','focus':['Electrical Power System','Electrical SCADA/EMS/DMS','DERMS / DER / VPP / Microgrid'],'max_age_days':MAX_AGE_DAYS,'source_status':status,'items':items}
 os.makedirs(os.path.dirname(OUT_PATH),exist_ok=True)
 with open(OUT_PATH,'w',encoding='utf-8') as f:json.dump(payload,f,ensure_ascii=False,indent=2)
 print(f'Published {len(items)} fresh items: {len(intl)} international + {len(vn)} Vietnam')
if __name__=='__main__':main()
