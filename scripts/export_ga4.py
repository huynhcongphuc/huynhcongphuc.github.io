import json, os
from datetime import datetime, timezone
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Filter, FilterExpression, Metric, RunReportRequest, RunRealtimeReportRequest
from google.oauth2 import service_account

PROPERTY_ID=os.environ['GA4_PROPERTY_ID']
CREDS=json.loads(os.environ['GA4_SERVICE_ACCOUNT_JSON'])
credentials=service_account.Credentials.from_service_account_info(CREDS,scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client=BetaAnalyticsDataClient(credentials=credentials)
PROP=f'properties/{PROPERTY_ID}'
ALL_TIME_START='2020-01-01'

SOFTWARE_EVENTS={
 'download_secureapp':'SecureApp',
 'download_master_server':'Master Server Protocol',
 'download_der_simulator':'DER Simulator',
 'download_microgrid_simulator':'Microgrid Simulator',
 'download_vpp_platform':'VPP Platform'
}
RESEARCH_EVENTS={
 'download_research_ieee2030_5':'IEEE 2030.11 & IEEE 2030.5 DERMS Research',
 'download_research_abess':'ABESS Reliability Paper',
 'download_research_flisr_ieee':'IEEE FLISR with DG Paper',
 'download_research_flisr_vn':'FLISR with Distributed Generation Paper'
}
RESEARCH_LINKS={
 '/682/919':'download_research_abess',
 'arnumber=9314599':'download_research_flisr_ieee',
 '/749/1044':'download_research_flisr_vn'
}
RESEARCH_FALLBACK_EVENTS=['research_download','file_download','file_download_click','click']
UNKNOWN_COUNTRY_VALUES={'','(not set)','(other)','unknown','not set','other'}

def normalize_country(value):
    raw=(value or '').strip()
    return 'Unknown' if raw.lower() in UNKNOWN_COUNTRY_VALUES else raw

def merge_countries(rows):
    merged={}
    for country,value in rows:
        key=normalize_country(country)
        merged[key]=merged.get(key,0)+int(value)
    return [{'country':country,'users':users} for country,users in sorted(merged.items(),key=lambda item:item[1],reverse=True)]

def report(start,end,dimensions,metrics,event_filter=None):
    req=RunReportRequest(property=PROP,date_ranges=[DateRange(start_date=start,end_date=end)],dimensions=[Dimension(name=x) for x in dimensions],metrics=[Metric(name=x) for x in metrics])
    if event_filter:
        req.dimension_filter=FilterExpression(filter=Filter(field_name='eventName',in_list_filter=Filter.InListFilter(values=event_filter)))
    return client.run_report(req)

def realtime_report(dimensions,metrics):
    req=RunRealtimeReportRequest(property=PROP,dimensions=[Dimension(name=x) for x in dimensions],metrics=[Metric(name=x) for x in metrics],limit=100)
    return client.run_realtime_report(req)

def metric_value(resp,idx=0):
    return int(float(resp.rows[0].metric_values[idx].value)) if resp.rows else 0

def event_counts_realtime(event_map):
    counts={ev:0 for ev in event_map}
    r=realtime_report(['eventName'],['eventCount'])
    for row in r.rows:
        ev=row.dimension_values[0].value
        if ev in counts: counts[ev]=int(float(row.metric_values[0].value))
    return counts

def event_counts_period(start,end,event_map):
    r=report(start,end,['eventName'],['eventCount'],list(event_map))
    return {row.dimension_values[0].value:int(float(row.metric_values[0].value)) for row in r.rows}

def research_link_fallback(start,end):
    counts={ev:0 for ev in RESEARCH_EVENTS}
    try:
        r=report(start,end,['eventName','linkUrl'],['eventCount'],RESEARCH_FALLBACK_EVENTS)
        for row in r.rows:
            url=row.dimension_values[1].value or ''
            n=int(float(row.metric_values[0].value))
            for marker,ev in RESEARCH_LINKS.items():
                if marker in url:
                    counts[ev]+=n
                    break
        print('Research fallback counts:', counts)
    except Exception as exc:
        print('Research link fallback unavailable:', type(exc).__name__, str(exc)[:200])
    return counts

def merged_research_counts(start,end):
    specific=event_counts_period(start,end,RESEARCH_EVENTS)
    fallback=research_link_fallback(start,end)
    return {ev:max(specific.get(ev,0),fallback.get(ev,0)) for ev in RESEARCH_EVENTS}

def period(start,end='today'):
    sessions=metric_value(report(start,end,[],['sessions']))
    users=metric_value(report(start,end,[],['activeUsers']))
    views=metric_value(report(start,end,[],['screenPageViews']))
    downloads=metric_value(report(start,end,[],['eventCount'],list(SOFTWARE_EVENTS)))
    raw_countries=[]
    r=report(start,end,['country'],['activeUsers'])
    for row in r.rows:
        raw_countries.append((row.dimension_values[0].value,int(float(row.metric_values[0].value))))
    countries=merge_countries(raw_countries)
    vn=sum(x['users'] for x in countries if x['country']=='Vietnam')
    abroad=sum(x['users'] for x in countries if x['country']!='Vietnam')
    sw_counts=event_counts_period(start,end,SOFTWARE_EVENTS)
    rs_counts=merged_research_counts(start,end)
    research_downloads=sum(rs_counts.values())
    sw=[{'event':ev,'name':label,'downloads':sw_counts.get(ev,0)} for ev,label in SOFTWARE_EVENTS.items()]
    research=[{'event':ev,'name':label,'downloads':rs_counts.get(ev,0)} for ev,label in RESEARCH_EVENTS.items()]
    return {'sessions':sessions,'users':users,'views':views,'downloads':downloads,'research_downloads':research_downloads,'vietnam':vn,'abroad':abroad,'countries':countries[:10],'software':sw,'research':research}

def realtime():
    active=0; views=0; pages=[]
    r=realtime_report([],['activeUsers','screenPageViews'])
    if r.rows:
        active=int(float(r.rows[0].metric_values[0].value)); views=int(float(r.rows[0].metric_values[1].value))
    raw_countries=[]
    r=realtime_report(['country'],['activeUsers'])
    for row in r.rows:
        raw_countries.append((row.dimension_values[0].value,int(float(row.metric_values[0].value))))
    countries=merge_countries(raw_countries)[:10]
    r=realtime_report(['unifiedScreenName'],['activeUsers','screenPageViews'])
    for row in r.rows: pages.append({'page':row.dimension_values[0].value or '(not set)','users':int(float(row.metric_values[0].value)),'views':int(float(row.metric_values[1].value))})
    sw_counts=event_counts_realtime(SOFTWARE_EVENTS)
    rs_counts=event_counts_realtime(RESEARCH_EVENTS)
    software=[{'event':ev,'name':label,'downloads':sw_counts.get(ev,0)} for ev,label in SOFTWARE_EVENTS.items()]
    research=[{'event':ev,'name':label,'downloads':rs_counts.get(ev,0)} for ev,label in RESEARCH_EVENTS.items()]
    return {'active_users':active,'views':views,'countries':countries,'pages':sorted(pages,key=lambda x:x['views'],reverse=True)[:10],'downloads':sum(sw_counts.values()),'research_downloads':sum(rs_counts.values()),'software':software,'research':research}

def daily_series():
    rows={}
    base=report('29daysAgo','today',['date'],['sessions','activeUsers','screenPageViews'])
    for row in base.rows:
        date=row.dimension_values[0].value
        rows[date]={'date':date,'sessions':int(float(row.metric_values[0].value)),'users':int(float(row.metric_values[1].value)),'views':int(float(row.metric_values[2].value)),'software_downloads':0,'research_downloads':0}
    r=report('29daysAgo','today',['date'],['eventCount'],list(SOFTWARE_EVENTS))
    for row in r.rows:
        date=row.dimension_values[0].value
        rows.setdefault(date,{'date':date,'sessions':0,'users':0,'views':0,'software_downloads':0,'research_downloads':0})
        rows[date]['software_downloads']=int(float(row.metric_values[0].value))
    try:
        r=report('29daysAgo','today',['date','eventName','linkUrl'],['eventCount'],RESEARCH_FALLBACK_EVENTS)
        by_date={}
        for row in r.rows:
            date=row.dimension_values[0].value
            url=row.dimension_values[2].value or ''
            if any(marker in url for marker in RESEARCH_LINKS):
                by_date[date]=by_date.get(date,0)+int(float(row.metric_values[0].value))
        for date,n in by_date.items():
            rows.setdefault(date,{'date':date,'sessions':0,'users':0,'views':0,'software_downloads':0,'research_downloads':0})
            rows[date]['research_downloads']=n
    except Exception as exc:
        print('Daily research fallback unavailable:', type(exc).__name__, str(exc)[:200])
    return sorted(rows.values(),key=lambda x:x['date'])

out={'source':'Google Analytics 4','property_id':PROPERTY_ID,'measurement_id':'G-GT3E67GPJM','updated_at':datetime.now(timezone.utc).isoformat(),'realtime':realtime(),'periods':{'today':period('today'),'7d':period('6daysAgo'),'30d':period('29daysAgo'),'all':period(ALL_TIME_START)},'daily':daily_series()}
os.makedirs('data',exist_ok=True)
with open('data/ga4-stats.json','w',encoding='utf-8') as f: json.dump(out,f,ensure_ascii=False,indent=2)
