import re

filepath = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\crear-pedido.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure submit event is async and replace the logic
script_replacement = """        // Form Submit
        document.getElementById('orderForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const isPastel = selectProducto.options[selectProducto.selectedIndex]?.dataset.isPastel === 'true';

            // Recolectar datos extra
            const orderData = {
                fecha: document.getElementById('fecha').value,
                hora: document.getElementById('hora').value,
                domicilio: document.getElementById('domicilio').value,
                sabor: document.getElementById('sabor').value,
                dedicatoria: document.getElementById('dedicatoria').value,
                descripcion: document.getElementById('descripcion').value
            };

            if (isPastel) {
                orderData.armado = document.querySelector('input[name="armado"]:checked').value;
                orderData.pisos = document.getElementById('pisos').value;
                orderData.diseno = document.getElementById('diseno_pastel').value;
            }

            try {
                const btnSubmit = this.querySelector('button[type="submit"]');
                const btnOriginalText = btnSubmit.innerHTML;
                btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';
                btnSubmit.disabled = true;

                const idCliente = localStorage.getItem('userId') || null;
                const idCarrito = await obtenerOCrearCarrito(idCliente);

                if (!idCarrito) throw new Error("No se pudo crear el carrito");

                const itemData = {
                    id_carrito: idCarrito,
                    id_producto: parseInt(selectProducto.value),
                    id_variante: parseInt(selectTamano.value),
                    cantidad: 1, 
                    precio_unitario: precioBase,
                    sabor: orderData.sabor,
                    dedicatoria: orderData.dedicatoria,
                    observaciones: JSON.stringify(orderData)
                };

                const res = await agregarItemCarrito(itemData);
                
                if (res) {
                    // Update button temporarily to show success
                    btnSubmit.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
                    setTimeout(() => {
                        window.location.href = 'carrito.html'; // Redirect to cart
                    }, 500);
                } else {
                    throw new Error("Error en DB");
                }
            } catch (error) {
                console.error("Submit Error:", error);
                alert("Hubo un problema agregando al carrito. Intenta nuevamente.");
                const btnSubmit = document.querySelector('#orderForm button[type="submit"]');
                btnSubmit.innerHTML = 'Agregar al Carrito <i class="fas fa-shopping-cart" style="margin-left: 10px;"></i>';
                btnSubmit.disabled = false;
            }
        });"""

content = re.sub(r'        // Form Submit\s+document\.getElementById\(\'orderForm\'\)\.addEventListener\(\'submit\', function \(e\) \{.*?\}\);', script_replacement, content, flags=re.DOTALL)

# Change button html text
content = content.replace('Continuar al Pago <i\n                                class="fas fa-arrow-right" style="margin-left: 10px;"></i>', 'Agregar al Carrito <i\n                                class="fas fa-shopping-cart" style="margin-left: 10px;"></i>')
content = content.replace('Continuar al Pago <i class="fas fa-arrow-right" style="margin-left: 10px;"></i>', 'Agregar al Carrito <i class="fas fa-shopping-cart" style="margin-left: 10px;"></i>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("crear-pedido.html modified for cart flow")
