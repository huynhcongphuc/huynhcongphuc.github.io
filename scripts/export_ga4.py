import json, os
from datetime import datetime, timezone
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Filter, FilterExpression, Metric, RunReportRequest
from google.oauth2 import service_account

PROPERTY_ID=os.environ['GA4_PROPERTY_ID']
CREDS=json.loads(os.environ['GA4_SERVICE_ACCOUNT_JSON'])
credentials=service_account.Credentials.from_service_account_info(CREDS,scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client=BetaAnalyticsDataClient(credentials=credentials)
PROP=f'properties/{PROPERTY_ID}'

SOFTWARE_EVENTS={
 'download_secureapp':'SecureApp',
 'download_master_server':'Master Server Protocol',
 'download_der_simulator':'DER Simulator',
 'download_microgrid_simulator':'Microgrid Simulator'
}

def report(start,end,dimensions,metrics,event_filter=None):
    req=RunReportRequest(property=PROP,date_ranges=[DateRange(start_date=start,end_date=end)],dimensions=[Dimension(name=x) for x in dimensions],metrics=[Metric(name=x) for x in metrics])
    if event_filter:
        req.dimension_filter=FilterExpression(filter=Filter(field_name='eventName',in_list_filter=Filter.InListFilter(values=event_filter)))
    return client.run_report(req)

def metric_value(resp,idx=0):
    return int(resp.rows[0].metric_values[idx].value) if resp.rows else 0

def period(start,end='today'):
    sessions=metric_value(report(start,end,[],['sessions']))
    users=metric_value(report(start,end,[],['activeUsers']))
    downloads=metric_value(report(start,end,[],['eventCount'],list(SOFTWARE_EVENTS)))
    countries=[]; vn=0; abroad=0
    r=report(start,end,['country'],['activeUsers'])
    for row in r.rows:
        country=row.dimension_values[0].value or 'Unknown'; value=int(row.metric_values[0].value)
        countries.append({'country':country,'users':value})
        if country=='Vietnam': vn+=value
        else: abroad+=value
    sw=[]
    r=report(start,end,['eventName'],['eventCount'],list(SOFTWARE_EVENTS))
    counts={row.dimension_values[0].value:int(row.metric_values[0].value) for row in r.rows}
    for ev,label in SOFTWARE_EVENTS.items(): sw.append({'event':ev,'name':label,'downloads':counts.get(ev,0)})
    return {'sessions':sessions,'users':users,'downloads':downloads,'vietnam':vn,'abroad':abroad,'countries':sorted(countries,key=lambda x:x['users'],reverse=True)[:10],'software':sw}

daily=[]
r=report('29daysAgo','today',['date'],['sessions','activeUsers','eventCount'])
for row in r.rows:
    daily.append({'date':row.dimension_values[0].value,'sessions':int(row.metric_values[0].value),'users':int(row.metric_values[1].value),'events':int(row.metric_values[2].value)})

out={'source':'Google Analytics 4','measurement_id':'G-GT3E67GPJM','updated_at':datetime.now(timezone.utc).isoformat(),'periods':{'today':period('today'),'7d':period('6daysAgo'),'30d':period('29daysAgo')},'daily':sorted(daily,key=lambda x:x['date'])}
os.makedirs('data',exist_ok=True)
with open('data/ga4-stats.json','w',encoding='utf-8') as f: json.dump(out,f,ensure_ascii=False,indent=2)
