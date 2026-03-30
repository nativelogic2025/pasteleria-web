import urllib.request
import json
import urllib.error

url = 'https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/'
headers = {
    'apikey': 'sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
    'Authorization': 'Bearer sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        tables = [t for t,v in data['paths'].items() if t != '/']
        print("TABLAS ENCONTRADAS:", sorted(tables))
except Exception as e:
    print("ERROR:", e)
