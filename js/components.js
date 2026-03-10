class HeaderComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header class="navbar">
            <div class="container nav-container">
                <a href="index.html" class="logo">
                    <img src="img/logo.jpeg" alt="Pastelería La Estrella Logo" class="logo-img">
                    <span class="logo-text">La Estrella</span>
                </a>
                <nav class="nav-links">
                    <a href="index.html">Inicio</a>
                    <a href="galeria.html">Catálogo & Galería</a>
                    <a href="crear-pedido.html">Crear Pedido</a>
                    <a href="ver-pedido.html">Ver Pedido</a>
                    <a href="contacto.html">Contáctanos</a>
                    <a href="carrito.html" class="nav-cart-btn" style="color: var(--color-primary); font-size: 1.2rem; margin-left: 0.5rem;" title="Mi Carrito"><i class="fas fa-shopping-cart"></i></a>
                    <a href="login.html" class="btn btn-primary" style="padding: 0.4rem 1.2rem; margin-left:1rem; min-width: 120px; text-align: center;" id="navAccountBtn">Mi Cuenta</a>
                </nav>
                <div class="mobile-menu-btn"><i class="fas fa-bars"></i></div>
            </div>
        </header>
        `;

        // Lógica de usuario logueado en Navbar
        setTimeout(() => {
            const btn = document.getElementById('navAccountBtn');
            if (btn && localStorage.getItem('isLoggedIn') === 'true') {
                const userName = localStorage.getItem('userName') || 'Perfil';
                // Mostrar solo el primer nombre si es muy largo
                const shortName = userName.split(' ')[0];
                btn.innerHTML = `<i class="fas fa-user-circle" style="margin-right:0.4rem; font-size: 1.1rem;"></i> Hola, ${shortName}`;
                btn.href = 'perfil.html';
                btn.style.backgroundColor = 'var(--color-bg)';
                btn.style.color = 'var(--color-primary)';
                btn.style.border = '1px solid var(--color-primary)';
                btn.title = "Ir a mi perfil";
            }
        }, 50); // Small delay to let DOM render
    }
}

class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="footer">
            <div class="container footer-grid">
                <div class="footer-col">
                    <a href="index.html" class="logo footer-logo">
                        <span class="logo-text">La Estrella</span>
                    </a>
                    <p>Elaborando felicidad en forma de deliciosos pasteles para tus momentos más especiales.</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/PastlriaLaEstrella?locale=es_LA" target="_blank"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/pasteleria_estrella99?utm_source=qr&igsh=dGJxcGlnd2FnaHpn" target="_blank"><i class="fab fa-instagram"></i></a>
                        <a href="https://wa.me/5215515723305" target="_blank"><i class="fab fa-whatsapp"></i></a>
                        <a href="https://www.tiktok.com/@pastelerialaestrella" target="_blank"><i class="fab fa-tiktok"></i></a>
                    </div>
                </div>

                <div class="footer-col">
                    <h3>Enlaces Rápidos</h3>
                    <ul>
                        <li><a href="index.html">Inicio</a></li>
                        <li><a href="galeria.html">Catálogo</a></li>
                        <li><a href="crear-pedido.html">Personalizar</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h3>Atención al Cliente</h3>
                    <ul>
                        <li><a href="ver-pedido.html">Rastrear Pedido</a></li>
                        <li><a href="contacto.html">Contacto</a></li>
                        <li><a href="login.html">Mi Cuenta</a></li>
                    </ul>
                </div>

                <div class="footer-col contact-info">
                    <h3>Contacto</h3>
                    <p><i class="fas fa-map-marker-alt"></i> Av, Boulevar Ejército Mexicano No.1, Centro, 43803 Tizayuca, Hgo.</p>
                    <p><i class="fas fa-phone"></i> +52 1 55 1572 3305</p>
                    <p><i class="fas fa-envelope"></i> pastlria.la.estrella@gmail.com</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Pastelería La Estrella. Todos los derechos reservados.</p>
            </div>
        </footer>
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
    badge.style.bottom = '20px';
    badge.style.left = '20px';
    badge.style.padding = '8px 15px';
    badge.style.borderRadius = '20px';
    badge.style.backgroundColor = 'var(--color-white)';
    badge.style.color = 'var(--color-text)';
    badge.style.fontSize = '0.85rem';
    badge.style.fontWeight = 'bold';
    badge.style.zIndex = '9999';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '8px';
    badge.style.boxShadow = 'var(--shadow-md)';
    badge.style.border = '1px solid var(--color-border)';
    badge.style.fontFamily = 'var(--font-body)';
    badge.innerHTML = '<span style="width:10px;height:10px;border-radius:50%;background-color:#9CA3AF; display:inline-block;" id="db-status-dot"></span> <span id="db-status-text">Conectando BD...</span>';
    document.body.appendChild(badge);

    const checkUrl = 'https://wvogrcteltojtjvneyv.supabase.co/rest/v1/categorias?select=id_categoria&limit=1';
    const checkHeaders = {
        'apikey': 'sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
        'Authorization': 'Bearer sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    fetch(checkUrl, { method: 'GET', headers: checkHeaders, cache: 'no-store' })
        .then(async res => {
            if (res.ok) {
                document.getElementById('db-status-dot').style.backgroundColor = '#10B981'; // Green
                document.getElementById('db-status-text').textContent = 'Conectado a DB';
            } else {
                const errTxt = await res.text();
                throw new Error(`HTTP ${res.status}: ${errTxt}`);
            }
        })
        .catch(err => {
            document.getElementById('db-status-dot').style.backgroundColor = '#EF4444'; // Red
            document.getElementById('db-status-text').textContent = 'DB Desconectada';
            console.error('DB Connection Check Failed:', err);
        });
});
