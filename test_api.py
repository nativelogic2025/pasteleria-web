import urllib.request
import urllib.error
import json

url = 'https://wvogrcteltoljtjvneyv.supabase.co//rest/v1/categorias?select=*'
headers = {
    'apikey': 'sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
    'Authorization': 'Bearer sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
    'Content-Type': 'application/json; charset=utf-8'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        data = response.read().decode('utf-8')
        print(data)
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
