import re

filepath = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\js\supabase.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Append Auth methods
auth_methods = """
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
 * Inicia sesión buscando email y contraseña exactos
 */
async function loginCliente(email, password) {
    try {
        const response = await fetch(`${SUPABASE_URL}/clientes?select=*&email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}&limit=1`, {
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
"""

content = content + auth_methods

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch supabase.js auth done")
