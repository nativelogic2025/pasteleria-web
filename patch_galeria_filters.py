import re

filepath = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\galeria.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the filter buttons dynamic
filter_replacement = """            <!-- Filtros Dinámicos -->
            <div class="catalog-filters" id="categoryFilters" style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 3rem; flex-wrap: wrap;">
                <button class="btn btn-primary filter-btn" data-cat="todos" style="padding: 0.5rem 1.5rem;">Cargando...</button>
            </div>"""
content = re.sub(r'            <!-- Filters \(Visual only for now, can be wired in JS later if needed\) -->.*?</div>', filter_replacement, content, flags=re.DOTALL)

# Modify script string
script_replacement = """    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const grid = document.querySelector('.featured-grid');
            const filtersContainer = document.getElementById('categoryFilters');
            
            if (grid) {
                grid.innerHTML = '<div style="text-align: center; grid-column: 1 / -1; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-2x" style="color: var(--color-primary); margin-bottom: 1rem;"></i><p>Cargando nuestro catálogo...</p></div>';
            }

            try {
                // 1. Fetch Categories
                const categorias = await fetchCategorias();
                if (filtersContainer && categorias) {
                    filtersContainer.innerHTML = '<button class="btn btn-primary filter-btn" data-cat="todos" style="padding: 0.5rem 1.5rem;">Todos</button>';
                    categorias.forEach(cat => {
                        filtersContainer.innerHTML += `<button class="btn btn-outline filter-btn" data-cat="${cat.id_categoria}" style="padding: 0.5rem 1.5rem;">${cat.nombre}</button>`;
                    });
                }

                // 2. Fetch Products
                const productos = await fetchProductos();
                if (!grid) return;
                
                function renderProducts(listaProductos) {
                    grid.innerHTML = '';
                    if (!listaProductos || listaProductos.length === 0) {
                        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No hay productos disponibles en esta categoría.</p>';
                        return;
                    }

                    listaProductos.forEach(producto => {
                        let precioBase = 0;
                        if (producto.producto_variantes && producto.producto_variantes.length > 0) {
                            const precios = producto.producto_variantes.map(v => parseFloat(v.precio_venta));
                            precioBase = Math.min(...precios);
                        }

                        const card = document.createElement('div');
                        card.className = 'product-card';
                        card.innerHTML = `
                            <div class="product-img-wrapper">
                                <img src="${producto.imagen_url || 'img/cake1-placeholder.png'}" alt="${producto.nombre}" class="product-img" onerror="this.src='img/cake1-placeholder.png'">
                                ${producto.categorias ? `<span class="badge">${producto.categorias.nombre || ''}</span>` : ''}
                            </div>
                            <div class="product-info">
                                <h3 class="product-title">${producto.nombre}</h3>
                                <p class="product-desc">${producto.descripcion || 'Delicioso pastel artesanal.'}</p>
                                <div class="product-footer">
                                    <span class="price">${precioBase > 0 ? `Desde $${precioBase} MXN` : 'Consultar'}</span>
                                    <a href="crear-pedido.html?producto=${producto.id_producto}" class="btn-icon" title="Pedir este"><i class="fas fa-cart-plus"></i></a>
                                </div>
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                }

                // Initial render of all products
                renderProducts(productos);

                // 3. Filter Logic
                if (filtersContainer) {
                    filtersContainer.addEventListener('click', (e) => {
                        if (e.target.classList.contains('filter-btn')) {
                            // Update visual state of buttons
                            document.querySelectorAll('.filter-btn').forEach(btn => {
                                btn.classList.remove('btn-primary');
                                btn.classList.add('btn-outline');
                            });
                            e.target.classList.remove('btn-outline');
                            e.target.classList.add('btn-primary');

                            // Filter logic
                            const catId = e.target.dataset.cat;
                            if (catId === 'todos') {
                                renderProducts(productos);
                            } else {
                                const filtered = productos.filter(p => String(p.id_categoria) === catId);
                                renderProducts(filtered);
                            }
                        }
                    });
                }

            } catch (error) {
                console.error(error);
                if (grid) grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Hubo un error al cargar el catálogo.</p>';
            }
        });
    </script>"""

content = re.sub(r'    <script>\s*document\.addEventListener\(\'DOMContentLoaded\', async \(\) => {.*?    </script>', script_replacement, content, flags=re.DOTALL)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch galeria filters done")
