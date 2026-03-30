/**
 * Supabase Config & REST API Wrapper
 */
const SUPABASE_URL = 'https://wvogrcteltoljtjvneyv.supabase.co/rest/v1';
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
        if (!response.ok) throw new Error('Error al obtener categorÃ­as');
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
        const response = await fetch(`${SUPABASE_URL}/pedidos`, {
            method: 'POST',
            headers: { ...HEADERS, 'Prefer': 'return=representation' },
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
        const response = await fetch(`${SUPABASE_URL}/detalle_pedido`, {
            method: 'POST',
            headers: { ...HEADERS, 'Prefer': 'return=representation' },
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
        const response = await fetch(`${SUPABASE_URL}/pagos`, {
            method: 'POST',
            headers: { ...HEADERS, 'Prefer': 'return=representation' },
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
        const response = await fetch(`${SUPABASE_URL}/pedidos?folio=eq.${folio}&limit=1`, {
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
 * Update the state of an order
 */
async function actualizarEstadoPedido(idPedido, nuevoEstado) {
    try {
        const response = await fetch(`${SUPABASE_URL}/pedidos?id_pedido=eq.${idPedido}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!response.ok) throw new Error('Error al actualizar estado del pedido');
        return true;
    } catch (error) {
        console.error('actualizarEstadoPedido error:', error);
        return false;
    }
}

/**
 * Update the payment state
 */
async function actualizarEstadoPago(idPedido, nuevoEstadoPago) {
    try {
        const response = await fetch(`${SUPABASE_URL}/pagos?id_pedido=eq.${idPedido}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({ estado_pago: nuevoEstadoPago })
        });
        if (!response.ok) throw new Error('Error al actualizar el pago');
        return true;
    } catch (error) {
        console.error('actualizarEstadoPago error:', error);
        return false;
    }
}

/**
 * Upload receipt to Supabase Storage 'comprobantes' bucket
 */
async function subirComprobante(folio, file) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folio}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Uses the storage API
        const response = await fetch(`${SUPABASE_URL.replace('/rest/v1', '')}/storage/v1/object/comprobantes/${filePath}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                // No need to set Content-Type to application/json, it needs to be the file type
                'Content-Type': file.type
            },
            body: file
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al subir el comprobante');
        }

        // Return the public URL
        const publicUrlResponse = `${SUPABASE_URL.replace('/rest/v1', '')}/storage/v1/object/public/comprobantes/${filePath}`;
        return publicUrlResponse;
    } catch (error) {
        console.error('subirComprobante error:', error);
        return null;
    }
}

/**
 * Update the payment record with the receipt URL
 */
async function actualizarPagoConComprobante(idPago, comprobanteUrl) {
    try {
        const response = await fetch(`${SUPABASE_URL}/pagos?id_pago=eq.${idPago}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({ comprobante_url: comprobanteUrl, estado_pago: 'validacion_pendiente' })
        });
        if (!response.ok) throw new Error('Error al actualizar el pago con el comprobante');
        return true;
    } catch (error) {
        console.error('actualizarPagoConComprobante error:', error);
        return false;
    }
}

/**
 * --- SHOPPING CART FUNCTIONS ---
 */

async function obtenerOCrearCarrito(idCliente) {

    if (!idCliente) return null; // Requiere estar logueado como acordamos
    
    // Buscar carrito activo del usuario
    try {
        const res = await fetch(`${SUPABASE_URL}/carrito?id_cliente=eq.${idCliente}&activo=eq.true&select=id`, {
            headers: HEADERS
        });
        const data = await res.json();
    
        if (data && data.length > 0) {
            localStorage.setItem('carritoActivo', data[0].id);
            return data[0].id;
        }
    } catch (e) {
        console.error("Error al buscar carrito:", e);
    }
    
    // Si no tiene carrito activo, crear uno nuevo
    try {
        const crear = await fetch(`${SUPABASE_URL}/carrito`, {
            method: "POST",
            headers: { ...HEADERS, "Prefer": "return=representation" },
            body: JSON.stringify({
                id_cliente: parseInt(idCliente),
                activo: true
            })
        });
    
        const nuevo = await crear.json();
    
        if (nuevo && nuevo.length > 0) {
            localStorage.setItem('carritoActivo', nuevo[0].id);
            return nuevo[0].id;
        }
    } catch (e) {
        console.error("Error al crear la tabla carrito:", e);
    }

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
        const res = await fetch(`${SUPABASE_URL}/carrito_detalle?id_carrito=eq.${idCarrito}&select=*,producto_variantes(*,productos(*))`, {
            headers: HEADERS
        });
        const items = await res.json();
        
        // Add full URL to image_url for cart items
        const STORAGE_BASE = `${SUPABASE_URL.replace('/rest/v1', '')}/storage/v1/object/public/productos/`;
        return items.map(item => {
            if (item.producto_variantes && item.producto_variantes.productos) {
                const prod = item.producto_variantes.productos;
                if (prod.imagen_url && !prod.imagen_url.startsWith('http')) {
                    prod.imagen_url = STORAGE_BASE + prod.imagen_url;
                }
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
        const res = await fetch(`${SUPABASE_URL}/carrito_detalle?id=eq.${idDetalle}`, {
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
        const res = await fetch(`${SUPABASE_URL}/carrito?id=eq.${idCarrito}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({ activo: false })
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

/**
 * --- READ FUNCTIONS FOR PDF GENERATION ---
 */

async function obtenerClientePorId(idCliente) {
    try {
        const response = await fetch(`${SUPABASE_URL}/clientes?select=*&id_cliente=eq.${idCliente}&limit=1`, {
            method: 'GET',
            headers: HEADERS
        });
        if (!response.ok) throw new Error('Error al obtener el cliente');
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('obtenerClientePorId error:', error);
        return null;
    }
}

async function obtenerDetallesPorPedido(idPedido) {
    try {
        const response = await fetch(`${SUPABASE_URL}/detalle_pedido?id_pedido=eq.${idPedido}&select=*`, {
            method: 'GET',
            headers: HEADERS
        });
        if (!response.ok) throw new Error('Error al obtener los detalles del pedido');
        
        const detalles = await response.json();
        
        // Manual join to bypass Supabase native foreign-key relation errors
        for (let item of detalles) {
            if (item.id_variante) {
                try {
                    const varRes = await fetch(`${SUPABASE_URL}/producto_variantes?id_variante=eq.${item.id_variante}&select=*,productos(*)`, {
                        method: 'GET',
                        headers: HEADERS
                    });
                    if (varRes.ok) {
                        const varData = await varRes.json();
                        if (varData && varData.length > 0) {
                            item.producto_variantes = varData[0];
                            item.productos = varData[0].productos;
                        }
                    }
                } catch (e) {
                    console.error('Error fetching JOIN variante:', e);
                }
            }
        }
        
        return detalles;
    } catch (error) {
        console.error('obtenerDetallesPorPedido error:', error);
        return [];
    }
}

async function obtenerPagoPorPedido(idPedido) {
    try {
        const response = await fetch(`${SUPABASE_URL}/pagos?id_pedido=eq.${idPedido}&limit=1`, {
            method: 'GET',
            headers: HEADERS
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('obtenerPagoPorPedido error:', error);
        return null;
    }
}

async function obtenerPagosPorPedido(idPedido) {
    try {
        const response = await fetch(`${SUPABASE_URL}/pagos?id_pedido=eq.${idPedido}&order=id_pago.asc`, {
            method: 'GET',
            headers: HEADERS
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('obtenerPagosPorPedido error:', error);
        return [];
    }
}
