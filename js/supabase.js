/**
 * Supabase Config & REST API Wrapper
 */
const SUPABASE_URL = 'https://wvogrcteltoljtjvneyv.supabase.co//rest/v1';
const SUPABASE_KEY = 'sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-';

const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

/**
 * Fetch all active products with their variants and categories
 */
async function fetchProductos() {
    try {
        const response = await fetch(`${SUPABASE_URL}/productos?select=*,producto_variantes(*),categorias(*)&activo=eq.true`, {
            method: 'GET',
            headers: HEADERS
        });
        if (!response.ok) throw new Error('Error al obtener productos');
        const productos = await response.json();
        
        // Add full URL to image_url
        const STORAGE_BASE = `${SUPABASE_URL.replace('/rest/v1', '')}/storage/v1/object/public/productos/`;
        return productos.map(p => {
            if (p.imagen_url && !p.imagen_url.startsWith('http')) {
                p.imagen_url = STORAGE_BASE + p.imagen_url;
            }
            return p;
        });
    } catch (error) {
        console.error('fetchProductos error:', error);
        return [];
    }
}

/**
 * Fetch all categories
 */
async function fetchCategorias() {
    try {
        const response = await fetch(`${SUPABASE_URL}/categorias`, {
            method: 'GET',
            headers: HEADERS
        });
        if (!response.ok) throw new Error('Error al obtener categorías');
        return await response.json();
    } catch (error) {
        console.error('fetchCategorias error:', error);
        return [];
    }
}

/**
 * Fetch a single product by ID
 */
async function fetchProductoById(id) {
    try {
        const response = await fetch(`${SUPABASE_URL}/productos?select=*,producto_variantes(*)&id_producto=eq.${id}&limit=1`, {
            method: 'GET',
            headers: HEADERS
        });
        if (!response.ok) throw new Error('Error al obtener el producto');
        const data = await response.json();
        
        if (data.length > 0) {
            const p = data[0];
            const STORAGE_BASE = `${SUPABASE_URL.replace('/rest/v1', '')}/storage/v1/object/public/productos/`;
            if (p.imagen_url && !p.imagen_url.startsWith('http')) {
                p.imagen_url = STORAGE_BASE + p.imagen_url;
            }
            return p;
        }
        return null;
    } catch (error) {
        console.error('fetchProductoById error:', error);
        return null;
    }
}

/**
 * Create an online order
 */
async function crearPedidoOnline(datosPedido) {
    try {
        const response = await fetch(`${SUPABASE_URL}/pedidos_online`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(datosPedido)
        });
        if (!response.ok) throw new Error('Error al crear el pedido');
        return await response.json();
    } catch (error) {
        console.error('crearPedidoOnline error:', error);
        return null;
    }
}

/**
 * Create order details
 */
async function crearDetallePedidoOnline(datosExtra) {
    try {
        const response = await fetch(`${SUPABASE_URL}/detalle_pedido_online`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(datosExtra) // Can be an array for bulk insert
        });
        if (!response.ok) throw new Error('Error al crear el detalle del pedido');
        return await response.json();
    } catch (error) {
        console.error('crearDetallePedidoOnline error:', error);
        return null;
    }
}

/**
 * Save order payment transaction
 */
async function crearPagoPedidoOnline(datosPago) {
    try {
        const response = await fetch(`${SUPABASE_URL}/pagos_pedido_online`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(datosPago)
        });
        if (!response.ok) throw new Error('Error al guardar el pago del pedido');
        return await response.json();
    } catch (error) {
        console.error('crearPagoPedidoOnline error:', error);
        return null;
    }
}

/**
 * Fetch a single order by Folio
 */
async function buscarPedidoPorFolio(folio) {
    try {
        const response = await fetch(`${SUPABASE_URL}/pedidos_online?folio=eq.${folio}&limit=1`, {
            method: 'GET',
            headers: HEADERS
        });
        if (!response.ok) throw new Error('Error al buscar el pedido por folio');
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('buscarPedidoPorFolio error:', error);
        return null;
    }
}

/**
 * --- SHOPPING CART FUNCTIONS ---
 */

async function obtenerOCrearCarrito(idCliente = null) {
    let idCarrito = localStorage.getItem('carritoActivo');

    // If local storage has a cart ID, try to get it
    if (idCarrito) {
        try {
            const res = await fetch(`${SUPABASE_URL}/carrito?id_carrito=eq.${idCarrito}&estado=eq.activo`, { headers: HEADERS });
            const data = await res.json();
            if (data && data.length > 0) return data[0].id_carrito;
        } catch (e) { console.error(e); }
    }

    // Otherwise, create a new one
    try {
        const insertData = { estado: 'activo' };
        if (idCliente) insertData.id_cliente = idCliente;

        const res = await fetch(`${SUPABASE_URL}/carrito`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(insertData)
        });
        const data = await res.json();
        if (data && data.length > 0) {
            localStorage.setItem('carritoActivo', data[0].id_carrito);
            return data[0].id_carrito;
        }
    } catch (e) { console.error(e); }

    return null;
}

async function agregarItemCarrito(itemData) {
    try {
        const res = await fetch(`${SUPABASE_URL}/carrito_detalle`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(itemData)
        });
        return await res.json();
    } catch (e) {
        console.error('agregarItemCarrito error:', e);
        return null;
    }
}

async function obtenerItemsCarrito(idCarrito) {
    try {
        // Fetch cart details along with related product and variant info horizontally if possible
        // But since REST relations can be tricky, we just fetch detalle first
        const res = await fetch(`${SUPABASE_URL}/carrito_detalle?id_carrito=eq.${idCarrito}&select=*,productos(*),producto_variantes(*)`, {
            headers: HEADERS
        });
        const items = await res.json();
        
        // Add full URL to image_url for cart items
        const STORAGE_BASE = `${SUPABASE_URL.replace('/rest/v1', '')}/storage/v1/object/public/productos/`;
        return items.map(item => {
            if (item.productos && item.productos.imagen_url && !item.productos.imagen_url.startsWith('http')) {
                item.productos.imagen_url = STORAGE_BASE + item.productos.imagen_url;
            }
            return item;
        });
    } catch (e) {
        console.error('obtenerItemsCarrito error:', e);
        return [];
    }
}

async function eliminarItemCarrito(idDetalle) {
    try {
        const res = await fetch(`${SUPABASE_URL}/carrito_detalle?id_carrito_detalle=eq.${idDetalle}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        return res.ok;
    } catch (e) {
        console.error('eliminarItemCarrito error:', e);
        return false;
    }
}

async function vaciarCarrito(idCarrito) {
    try {
        const res = await fetch(`${SUPABASE_URL}/carrito_detalle?id_carrito=eq.${idCarrito}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        return res.ok;
    } catch (e) {
        console.error('vaciarCarrito error:', e);
        return false;
    }
}

async function completarCarrito(idCarrito) {
    try {
        const res = await fetch(`${SUPABASE_URL}/carrito?id_carrito=eq.${idCarrito}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({ estado: 'completado' })
        });
        if (res.ok) {
            localStorage.removeItem('carritoActivo');
        }
        return res.ok;
    } catch (e) {
        console.error('completarCarrito error:', e);
        return false;
    }
}

/**
 * --- AUTHENTICATION (CLIENTES TABLE) ---
 */

/**
 * Registra un cliente nuevo en la tabla 'clientes'
 */
async function registrarCliente(datosCliente) {
    try {
        const response = await fetch(`${SUPABASE_URL}/clientes`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(datosCliente)
        });

        // Return ok status to check if it passed or if email is duplicate (if unique constraint exists)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar al cliente');
        }

        return true;
    } catch (error) {
        console.error('registrarCliente error:', error);
        throw error;
    }
}

/**
 * Inicia sesión buscando correo y contraseña exactos
 */
async function loginCliente(email, password) {
    try {
        const response = await fetch(`${SUPABASE_URL}/clientes?select=*&correo=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}&limit=1`, {
            method: 'GET',
            headers: HEADERS
        });

        if (!response.ok) throw new Error('Error en la conexión con la base de datos');

        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('loginCliente error:', error);
        throw error;
    }
}

/**
 * Actualiza los datos de un cliente existente
 */
async function actualizarCliente(idCliente, datosActualizados) {
    try {
        const response = await fetch(`${SUPABASE_URL}/clientes?id_cliente=eq.${idCliente}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify(datosActualizados)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el cliente');
        }

        return true;
    } catch (error) {
        console.error('actualizarCliente error:', error);
        throw error;
    }
}
