import re

filepath = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\crear-pedido.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I want to add URL parsing logic right after `dbProductos.forEach...` block inside `DOMContentLoaded`.
# Let's just find `selectProducto.appendChild(option);` and `});` to insert there or just before the `catch` block.

injection = """
                // Auto-select product from URL if exists
                const urlParams = new URLSearchParams(window.location.search);
                const queryProduct = urlParams.get('producto');
                if (queryProduct) {
                    selectProducto.value = queryProduct;
                    // Trigger change event to load variants
                    const event = new Event('change');
                    selectProducto.dispatchEvent(event);
                }
"""

content = content.replace(
    'selectProducto.innerHTML = \'<option value="" disabled selected>-- No hay productos --</option>\';\n                }',
    'selectProducto.innerHTML = \'<option value="" disabled selected>-- No hay productos --</option>\';\n                }\n\n' + injection
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch URL params applied.")
