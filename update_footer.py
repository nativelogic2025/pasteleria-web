import os
import re

directory = r"c:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB"

new_footer = """    <!-- Footer -->
    <footer class="footer">
        <div class="container footer-grid">
            <div class="footer-col">
                <a href="index.html" class="logo footer-logo">
                    <span class="logo-text">La Estrella</span>
                </a>
                <p>Elaborando felicidad en forma de deliciosos pasteles para tus momentos más especiales.</p>
                <div class="social-links">
                    <a href="https://www.facebook.com/PastlriaLaEstrella?locale=es_LA" target="_blank"><i
                            class="fab fa-facebook-f"></i></a>
                    <a href="https://www.instagram.com/pasteleria_estrella99?utm_source=qr&igsh=dGJxcGlnd2FnaHpn"
                        target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://wa.me/5215515723305" target="_blank"><i class="fab fa-whatsapp"></i></a>
                    <a href="https://www.tiktok.com/@pastelerialaestrella" target="_blank"><i
                            class="fab fa-tiktok"></i></a>
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
                <p><i class="fas fa-map-marker-alt"></i> Av, Boulevar Ejército Mexicano No.1, Centro, 43803 Tizayuca,
                    Hgo.</p>
                <p><i class="fas fa-phone"></i> +52 1 55 1572 3305</p>
                <p><i class="fas fa-envelope"></i> pastlria.la.estrella@gmail.com</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 Pastelería La Estrella. Todos los derechos reservados.</p>
        </div>
    </footer>"""

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update Footer
        # Find everything from <!-- Footer --> to </footer>
        new_content = re.sub(r'<!-- Footer -->.*?</footer>', new_footer, content, flags=re.DOTALL)
        
        # Write back if changed
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
