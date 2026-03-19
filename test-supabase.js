const fs = require('fs');

const SUPABASE_URL = 'https://wvogrcteltoljtjvneyv.supabase.co/rest/v1';
const SUPABASE_KEY = 'sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-';

const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

async function check() {
    // get latest order
    const r1 = await fetch(`${SUPABASE_URL}/pedidos_online?order=created_at.desc&limit=1`, { headers: HEADERS });
    const orders = await r1.json();
    console.log("=== LATEST ORDER ===");
    console.log(JSON.stringify(orders[0], null, 2));

    if (orders.length > 0) {
        const order = orders[0];
        
        // get details
        const r2 = await fetch(`${SUPABASE_URL}/detalle_pedido_online?id_pedido=eq.${order.id_pedido}&select=*,productos(*),producto_variantes(*)`, { headers: HEADERS });
        let rawDet = await r2.text();
        console.log("\n=== DETAILS FETCH RESPONSE ===");
        console.log(rawDet);
        
        if(order.id_cliente) {
            const r3 = await fetch(`${SUPABASE_URL}/clientes?select=*&id_cliente=eq.${order.id_cliente}&limit=1`, { headers: HEADERS });
            let rawCliente = await r3.text();
            console.log("\n=== CLIENTE FETCH RESPONSE ===");
            console.log(rawCliente);
        }
    }
}

check();
