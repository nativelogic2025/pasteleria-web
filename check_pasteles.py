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
        
        with open('log_pasteles.txt', 'w', encoding='utf-8') as f:
            for p in data:
                f.write(f"ID {p['id_producto']} - {p['nombre']}\n")
                variantes = p.get('producto_variantes', [])
                if not variantes:
                    f.write("   [!] SIN VARIANTES\n")
                else:
                    sabores = set([v.get('sabor', 'N/A') for v in variantes])
                    f.write(f"   Sabores distintos: {sabores}\n")
                    f.write(f"   Total tamaños: {len(variantes)}\n")
except Exception as e:
    print("ERROR:", e)
