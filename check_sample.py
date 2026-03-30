import urllib.request
import json

url = 'https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/productos?id_categoria=eq.1&select=*,producto_variantes(*)'
headers = {
    'apikey': 'sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
    'Authorization': 'Bearer sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        for p in data:
            if p['id_producto'] in [101, 56, 38]:
                print(f"ID {p['id_producto']} - {p['nombre']}")
                variantes = p.get('producto_variantes', [])
                print(f"   Variantes: {len(variantes)}")
                for v in variantes[:3]:
                    print(f"     -> Sabor: {v.get('sabor')} | Tamaño: {v.get('tamaño')} | Precio: {v.get('precio_venta')}")
except Exception as e:
    print("ERROR:", e)
