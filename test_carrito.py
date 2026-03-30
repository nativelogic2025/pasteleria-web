import urllib.request
import json
import urllib.error

url = 'https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/carrito_detalle'
headers = {
    'apikey': 'sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
    'Authorization': 'Bearer sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

data = {
    "id_carrito": 1,
    "id_variante": 1,
    "cantidad": 1,
    "precio_unitario": 50
}

req = urllib.request.Request(url, headers=headers, data=json.dumps(data).encode('utf-8'))
try:
    with urllib.request.urlopen(req) as response:
        print("SUCCESS:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR {e.code}: {e.reason}")
    print("BODY:", e.read().decode('utf-8'))
except Exception as e:
    print("OTHER ERROR:", e)
