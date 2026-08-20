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
 'download_microgrid_simulator':'Microgrid Simulator'
}
RESEARCH_EVENTS={
 'download_research_ieee2030_5':'IEEE 2030.11 & IEEE 2030.5 DERMS Research',
 'download_research_abess':'ABESS Reliability Paper',
 'download_research_flisr_ieee':'IEEE FLISR with DG Paper',
 'download_research_flisr_vn':'FLISR with Distributed Generation Paper'
}

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

def period(start,end='today'):
    sessions=metric_value(report(start,end,[],['sessions']))
    users=metric_value(report(start,end,[],['activeUsers']))
    views=metric_value(report(start,end,[],['screenPageViews']))
    downloads=metric_value(report(start,end,[],['eventCount'],list(SOFTWARE_EVENTS)))
    research_downloads=metric_value(report(start,end,[],['eventCount'],list(RESEARCH_EVENTS)))
    countries=[]; vn=0; abroad=0
    r=report(start,end,['country'],['activeUsers'])
    for row in r.rows:
        country=row.dimension_values[0].value or 'Unknown'; value=int(float(row.metric_values[0].value))
        countries.append({'country':country,'users':value})
        if country=='Vietnam': vn+=value
        else: abroad+=value
    sw_counts=event_counts_period(start,end,SOFTWARE_EVENTS)
    rs_counts=event_counts_period(start,end,RESEARCH_EVENTS)
    sw=[{'event':ev,'name':label,'downloads':sw_counts.get(ev,0)} for ev,label in SOFTWARE_EVENTS.items()]
    research=[{'event':ev,'name':label,'downloads':rs_counts.get(ev,0)} for ev,label in RESEARCH_EVENTS.items()]
    return {'sessions':sessions,'users':users,'views':views,'downloads':downloads,'research_downloads':research_downloads,'vietnam':vn,'abroad':abroad,'countries':sorted(countries,key=lambda x:x['users'],reverse=True)[:10],'software':sw,'research':research}

def realtime():
    active=0; views=0; countries=[]; pages=[]
    r=realtime_report([],['activeUsers','screenPageViews'])
    if r.rows:
        active=int(float(r.rows[0].metric_values[0].value)); views=int(float(r.rows[0].metric_values[1].value))
    r=realtime_report(['country'],['activeUsers'])
    for row in r.rows: countries.append({'country':row.dimension_values[0].value or 'Unknown','users':int(float(row.metric_values[0].value))})
    r=realtime_report(['unifiedScreenName'],['activeUsers','screenPageViews'])
    for row in r.rows: pages.append({'page':row.dimension_values[0].value or '(not set)','users':int(float(row.metric_values[0].value)),'views':int(float(row.metric_values[1].value))})
    sw_counts=event_counts_realtime(SOFTWARE_EVENTS)
    rs_counts=event_counts_realtime(RESEARCH_EVENTS)
    software=[{'event':ev,'name':label,'downloads':sw_counts.get(ev,0)} for ev,label in SOFTWARE_EVENTS.items()]
    research=[{'event':ev,'name':label,'downloads':rs_counts.get(ev,0)} for ev,label in RESEARCH_EVENTS.items()]
    return {'active_users':active,'views':views,'countries':sorted(countries,key=lambda x:x['users'],reverse=True)[:10],'pages':sorted(pages,key=lambda x:x['views'],reverse=True)[:10],'downloads':sum(sw_counts.values()),'research_downloads':sum(rs_counts.values()),'software':software,'research':research}

def daily_series():
    rows={}
    base=report('29daysAgo','today',['date'],['sessions','activeUsers','screenPageViews'])
    for row in base.rows:
        date=row.dimension_values[0].value
        rows[date]={'date':date,'sessions':int(float(row.metric_values[0].value)),'users':int(float(row.metric_values[1].value)),'views':int(float(row.metric_values[2].value)),'software_downloads':0,'research_downloads':0}
    for key,event_map in [('software_downloads',SOFTWARE_EVENTS),('research_downloads',RESEARCH_EVENTS)]:
        r=report('29daysAgo','today',['date'],['eventCount'],list(event_map))
        for row in r.rows:
            date=row.dimension_values[0].value
            rows.setdefault(date,{'date':date,'sessions':0,'users':0,'views':0,'software_downloads':0,'research_downloads':0})
            rows[date][key]=int(float(row.metric_values[0].value))
    return sorted(rows.values(),key=lambda x:x['date'])

out={'source':'Google Analytics 4','property_id':PROPERTY_ID,'measurement_id':'G-GT3E67GPJM','updated_at':datetime.now(timezone.utc).isoformat(),'realtime':realtime(),'periods':{'today':period('today'),'7d':period('6daysAgo'),'30d':period('29daysAgo'),'all':period(ALL_TIME_START)},'daily':daily_series()}
os.makedirs('data',exist_ok=True)
with open('data/ga4-stats.json','w',encoding='utf-8') as f: json.dump(out,f,ensure_ascii=False,indent=2)
