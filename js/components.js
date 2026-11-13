class HeaderComponent extends HTMLElement {
    connectedCallback() {
        const currentPath = window.location.pathname;
        const page = currentPath.split("/").pop() || "index.html";
        const isActive = (target) => (page === target || (page === "" && target === "index.html")) ? "active" : "";

        this.innerHTML = `
        <header class="navbar">
            <div class="container nav-container">
                <a href="index.html" class="logo" aria-label="Pastelería La Estrella Inicio">
                    <img src="img/logo-horizontal.png?v=8" alt="Pastelería La Estrella" class="logo-img" style="height: 46px; width: auto; max-width: 180px; object-fit: contain; display: block;">
                </a>
                <nav class="nav-links">
                    <a href="index.html" class="${isActive('index.html')}">Inicio</a>
                    <a href="galeria.html" class="${isActive('galeria.html')}">Catálogo</a>
                    <a href="crear-pedido.html" class="${isActive('crear-pedido.html')}">Personalizar</a>
                    <a href="ver-pedido.html" class="${isActive('ver-pedido.html')}">Rastrear Pedido</a>
                    <a href="contacto.html" class="${isActive('contacto.html')}">Contacto</a>
                    <a href="carrito.html" class="nav-cart-btn ${isActive('carrito.html')}" style="color: var(--color-primary); font-size: 1.1rem; position: relative; padding: 0.35rem 0.5rem;" title="Mi Carrito">
                        <i class="fas fa-shopping-bag"></i>
                        <span id="navCartCount" style="position: absolute; top: -4px; right: -6px; background-color: var(--color-accent); color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 50%; box-shadow: 0 2px 6px rgba(232,93,117,0.4); display: none;">0</span>
                    </a>
                    <a href="login.html" class="btn btn-primary" style="padding: 0.48rem 1.2rem; min-width: 110px; text-align: center; font-size: 0.86rem;" id="navAccountBtn">Mi Cuenta</a>
                </nav>
                <div class="mobile-menu-btn" aria-label="Abrir menú"><i class="fas fa-bars"></i></div>
            </div>
        </header>
        `;

        setTimeout(() => {
            const btn = document.getElementById('navAccountBtn');
            if (btn && localStorage.getItem('isLoggedIn') === 'true') {
                const userName = localStorage.getItem('userName') || 'Perfil';
                const shortName = userName.split(' ')[0];
                btn.innerHTML = `<i class="fas fa-user-circle"></i> Hola, ${shortName}`;
                btn.href = 'perfil.html';
                btn.style.background = 'var(--color-secondary-soft)';
                btn.style.color = 'var(--color-primary-dark)';
                btn.style.border = '1px solid var(--color-border-strong)';
                btn.style.boxShadow = 'none';
                btn.title = "Ir a mi perfil";
            }

            const navCartCount = document.getElementById('navCartCount');
            const idCarrito = localStorage.getItem('carritoActivo');

            if (idCarrito && navCartCount && typeof window.obtenerItemsCarrito === 'function') {
                window.obtenerItemsCarrito(idCarrito).then(items => {
                    if (items && items.length > 0) {
                        let totalQty = 0;
                        items.forEach(i => totalQty += parseInt(i.cantidad || 1));
                        if (totalQty > 0) {
                            navCartCount.textContent = totalQty;
                            navCartCount.style.display = 'inline-block';
                        }
                    }
                }).catch(e => console.error("Error al cargar contador del carrito", e));
            }
        }, 300);
    }
}

class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="footer">
            <div class="container footer-grid">
                <div class="footer-col">
                    <a href="index.html" class="logo footer-logo" style="margin-bottom: 0.9rem; display: inline-block;">
                        <img src="img/logo-footer.png?v=8" alt="Pastelería La Estrella" style="height: 44px; width: auto; max-width: 175px; object-fit: contain; display: block;">
                    </a>
                    <p style="font-size: 0.9rem; line-height: 1.6; opacity: 0.85;">Pastelería familiar en Tizayuca elaborando pasteles artesanales con receta casera desde 1999.</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/PastlriaLaEstrella?locale=es_LA" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/pasteleria_estrella99?utm_source=qr&igsh=dGJxcGlnd2FnaHpn" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="https://wa.me/5215515723305" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                        <a href="https://www.tiktok.com/@pastelerialaestrella" target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                    </div>
                </div>

                <div class="footer-col">
                    <h3>Explorar</h3>
                    <ul>
                        <li><a href="index.html">Inicio</a></li>
                        <li><a href="galeria.html">Catálogo y Galería</a></li>
                        <li><a href="crear-pedido.html">Personalizar Pastel</a></li>
                        <li><a href="carrito.html">Mi Carrito</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h3>Atención al Cliente</h3>
                    <ul>
                        <li><a href="ver-pedido.html">Rastrear Mi Pedido</a></li>
                        <li><a href="contacto.html">Contacto y Ubicación</a></li>
                        <li><a href="login.html">Mi Cuenta</a></li>
                    </ul>
                </div>

                <div class="footer-col contact-info">
                    <h3>Visítanos</h3>
                    <p><i class="fas fa-map-marker-alt"></i> Av. Boulevar Ejército Mexicano No.1, Centro, 43803 Tizayuca, Hgo.</p>
                    <p><i class="fas fa-phone"></i> +52 1 55 1572 3305</p>
                    <p><i class="fas fa-envelope"></i> pastlria.la.estrella@gmail.com</p>
                    <p><i class="fas fa-clock"></i> Lunes a Domingo: 9:00 am a 9:00 pm</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Pastelería La Estrella. Hecho con cariño en Tizayuca, Hidalgo.</p>
            </div>
        </footer>

        <a href="https://wa.me/5215515723305?text=Hola%20Pasteler%C3%ADa%20La%20Estrella!%20Me%20gustar%C3%ADa%20hacer%20una%20consulta." target="_blank" rel="noopener" class="wa-float-btn" title="Escríbenos por WhatsApp">
            <i class="fab fa-whatsapp"></i>
        </a>
        `;
    }
}

customElements.define('header-component', HeaderComponent);
customElements.define('footer-component', FooterComponent);

// Global Database Connection Indicator
document.addEventListener('DOMContentLoaded', () => {
    const badge = document.createElement('div');
    badge.id = 'global-db-status';
    badge.style.position = 'fixed';
    badge.style.bottom = '16px';
    badge.style.left = '16px';
    badge.style.padding = '6px 12px';
    badge.style.borderRadius = '999px';
    badge.style.backgroundColor = 'rgba(255, 253, 249, 0.94)';
    badge.style.backdropFilter = 'blur(8px)';
    badge.style.color = 'var(--color-text)';
    badge.style.fontSize = '0.74rem';
    badge.style.fontWeight = '600';
    badge.style.zIndex = '9999';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '6px';
    badge.style.boxShadow = 'var(--shadow-sm)';
    badge.style.border = '1px solid var(--color-border)';
    badge.style.fontFamily = 'var(--font-body)';
    badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background-color:#9CA3AF; display:inline-block;" id="db-status-dot"></span> <span id="db-status-text">Conectando...</span>';
    document.body.appendChild(badge);

    const checkUrl = 'https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/categorias?select=id_categoria&limit=1';
    const checkHeaders = {
        'apikey': 'sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
        'Authorization': 'Bearer sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    fetch(checkUrl, { method: 'GET', headers: checkHeaders, cache: 'no-store' })
        .then(async res => {
            if (res.ok) {
                document.getElementById('db-status-dot').style.backgroundColor = '#10B981';
                document.getElementById('db-status-text').textContent = 'Catálogo en línea';
            } else {
                const errTxt = await res.text();
                throw new Error(`HTTP ${res.status}: ${errTxt}`);
            }
        })
        .catch(err => {
            document.getElementById('db-status-dot').style.backgroundColor = '#EF4444';
            document.getElementById('db-status-text').textContent = 'Sin conexión';
            console.error('DB Connection Check Failed:', err);
        });
});
