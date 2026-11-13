/**
 * Archivo principal de JavaScript
 * Pastelería La Estrella
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Menú Móvil (Hamburguesa)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // 2. Ocultar menú móvil al hacer click en un enlace
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && navLinks) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn ? mobileMenuBtn.querySelector('i') : null;
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });

    // 3. Navbar con sombra suave al hacer scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                navbar.style.boxShadow = '0 6px 20px rgba(74, 42, 24, 0.08)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // 4. Establecer enlace activo dinámicamente
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
