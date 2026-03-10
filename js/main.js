/**
 * Archivo principal de JavaScript
 * Pastelería La Estrella
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Menú Móvil (Hamburguesa)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Cambiar ícono de barras a 'X'
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 2. Ocultar menú móvil al hacer click en un enlace
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // 3. Navbar con sombra al hacer scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
        }
    });

    // 4. (Opcional) Animaciones de entrada simples al hacer scroll
    // Puedes expandir esto después si lo necesitas para otras páginas
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.product-card, .about-text, .about-image');

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top <= windowHeight * 0.8) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };

    // Inicializar estilos ocultos para animar si existen
    const animatedElements = document.querySelectorAll('.product-card, .about-text, .about-image');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Ejecutar en scroll y al cargar
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Trigger initial

    // 5. Establecer enlace activo dinámicamente
    const currentPath = window.location.pathname;
    const page = currentPath.split("/").pop();
    const targetPage = page === "" ? "index.html" : page;

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetPage) {
            link.classList.add('active');
        }
    });
});
