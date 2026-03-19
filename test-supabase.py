import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "apikey": "sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-",
    "Authorization": "Bearer sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-",
    "Accept": "application/json"
}

def get(url):
    print("GET", url)
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            print("Status:", response.status)
            print(response.read().decode())
    except urllib.error.HTTPError as e:
        print("Error:", e.code)
        print(e.read().decode())

get("https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/pedidos_online?order=created_at.desc&limit=1")
get("https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/detalle_pedido_online?limit=1&select=*,productos(*),producto_variantes(*)")
