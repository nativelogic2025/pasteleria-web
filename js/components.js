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
                    <a href="login.html" class="btn btn-primary" style="padding: 0.4rem 1.2rem; margin-left:1rem;" id="navAccountBtn">Mi Cuenta</a>
                </nav>
                <div class="mobile-menu-btn"><i class="fas fa-bars"></i></div>
            </div>
        </header>
        `;
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
