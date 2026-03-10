import re
import os

filepath = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\crear-pedido.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the select options
content = re.sub(
    r'<select id="producto" class="form-control" required>.*?</select>',
    '<select id="producto" class="form-control" required>\n                                <option value="" disabled selected>-- Cargando productos... --</option>\n                            </select>',
    content,
    flags=re.DOTALL
)

# Replace the first script block up to `let precioBase`
script_replacement = """    <script src="js/components.js"></script>
    <script src="js/supabase.js"></script>
    <script src="js/main.js"></script>
    <script>
        // 1. Verificar Autenticación
        if (localStorage.getItem('isLoggedIn')) {
            document.getElementById('navAccountBtn').textContent = "Mi Perfil";
        }

        // Configurar fecha mínima al día de hoy
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').setAttribute('min', hoy);

        // Referencias a elementos
        const selectProducto = document.getElementById('producto');
        const selectTamano = document.getElementById('tamano');
        const opcionesPastel = document.getElementById('opcionesPastel');

        const txtBase = document.getElementById('txtBase');
        const txtFlete = document.getElementById('txtFlete');
        const txtTotal = document.getElementById('txtTotal');
        const txtDeposito = document.getElementById('txtDeposito');
        const txtRestante = document.getElementById('txtRestante');

        // Valores de Precio
        let precioBase = 0;
        const costoFlete = 50.00;
        let dbProductos = [];

        // Fetch de productos desde Supabase
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                dbProductos = await fetchProductos();
                
                selectProducto.innerHTML = '<option value="" disabled selected>-- Selecciona un producto --</option>';
                
                if (dbProductos && dbProductos.length > 0) {
                    dbProductos.forEach(prod => {
                        const option = document.createElement('option');
                        option.value = prod.id_producto;
                        option.textContent = prod.nombre;
                        option.dataset.isPastel = prod.categorias?.nombre?.toLowerCase().includes('pastel') || prod.nombre.toLowerCase().includes('pastel');
                        selectProducto.appendChild(option);
                    });
                } else {
                    selectProducto.innerHTML = '<option value="" disabled selected>-- No hay productos --</option>';
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        });

        selectProducto.addEventListener('change', function () {
            selectTamano.innerHTML = '<option value="" disabled selected>-- Selecciona un tamaño --</option>';
            selectTamano.disabled = false;
            precioBase = 0;
            actualizarPrecios();

            const selectedOption = this.options[this.selectedIndex];
            const productId = parseInt(this.value);
            const isPastel = selectedOption.dataset.isPastel === 'true';

            if (isPastel) {
                opcionesPastel.classList.remove('hidden');
            } else {
                opcionesPastel.classList.add('hidden');
            }

            // Find product and populate variants
            const producto = dbProductos.find(p => p.id_producto === productId);
            if (producto && producto.producto_variantes) {
                producto.producto_variantes.forEach(v => {
                    const el = document.createElement('option');
                    el.value = v.id_variante; 
                    el.textContent = v.tamaño + (v.porciones ? ` (${v.porciones} personas)` : '');
                    el.dataset.precio = v.precio_venta;
                    selectTamano.appendChild(el);
                });
            }
        });

        selectTamano.addEventListener('change', function () {
            const selectedOpt = this.options[this.selectedIndex];
            precioBase = parseFloat(selectedOpt.dataset.precio || 0);

            const isPastel = selectProducto.options[selectProducto.selectedIndex]?.dataset.isPastel === 'true';

            if (isPastel) {
                const esDoble = document.querySelector('input[name="armado"]:checked').value === 'Doble';
                if (esDoble) precioBase += 150;

                const pisos = parseInt(document.getElementById('pisos').value);
                if (pisos > 1) precioBase += (pisos - 1) * 200;
            }

            actualizarPrecios();
        });

        // Eventos extra si cambian opciones del pastel para recalcular precio
        document.querySelectorAll('input[name="armado"], #pisos').forEach(el => {
            el.addEventListener('change', () => {
                if (selectTamano.value) {
                    const event = new Event('change');
                    selectTamano.dispatchEvent(event);
                }
            });
        });

        function actualizarPrecios() {
            txtBase.textContent = `$${precioBase.toFixed(2)} MXN`;
            const total = precioBase > 0 ? precioBase + costoFlete : 0;
            txtTotal.textContent = `$${total.toFixed(2)} MXN`;

            const deposito = total / 2;
            txtDeposito.textContent = `$${deposito.toFixed(2)} MXN`;
            txtRestante.textContent = `$${deposito.toFixed(2)} MXN`;
        }

        // Form Submit
        document.getElementById('orderForm').addEventListener('submit', function (e) {
            e.preventDefault();

            const isPastel = selectProducto.options[selectProducto.selectedIndex]?.dataset.isPastel === 'true';

            // Recolectar datos
            const orderData = {
                fecha: document.getElementById('fecha').value,
                hora: document.getElementById('hora').value,
                domicilio: document.getElementById('domicilio').value,
                idProducto: parseInt(selectProducto.value),
                nombreProducto: selectProducto.options[selectProducto.selectedIndex].textContent,
                idVariante: parseInt(selectTamano.value),
                nombreVariante: selectTamano.options[selectTamano.selectedIndex].textContent,
                sabor: document.getElementById('sabor').value,
                dedicatoria: document.getElementById('dedicatoria').value,
                descripcion: document.getElementById('descripcion').value,
                precioBase: precioBase,
                flete: costoFlete,
                total: precioBase > 0 ? (precioBase + costoFlete) : 0,
                deposito: (precioBase > 0 ? (precioBase + costoFlete) : 0) / 2
            };

            if (isPastel) {
                orderData.armado = document.querySelector('input[name="armado"]:checked').value;
                orderData.pisos = document.getElementById('pisos').value;
                orderData.diseno = document.getElementById('diseno_pastel').value;
            }

            // Guardar en session local para recuperarlo en pago.html
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            window.location.href = 'pago.html';
        });

    </script>
</body>
"""

content = re.sub(r'    <script src="js/components\.js"></script>.*?</body>', script_replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied to crear-pedido.html")
