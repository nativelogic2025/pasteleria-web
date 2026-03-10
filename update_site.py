import os
import glob
import re

html_files = glob.glob('*.html')

# Data replacements
FACEBOOK_LINK = 'https://www.facebook.com/PastlriaLaEstrella?locale=es_LA'
WHATSAPP_LINK = 'https://wa.me/5215515723305'
TIKTOK_LINK = 'https://www.tiktok.com/@pastelerialaestrella?is_from_webapp=1&sender_device=pc'
PHONE_TEXT = '+52 1 55 1572 3305'
EMAIL_TEXT = 'pastlria.la.estrella@gmail.com'
ADDRESS_TEXT = 'Av, Boulevar Ejército Mexicano No.1, Centro, 43803 Tizayuca, Hgo.'
HISTORY_TEXT = '<p>En Pastelería La Estrella, somos una pastelería tradicional fundada en 1999 con el firme propósito de endulzar la vida de nuestras familias y clientes. Cada una de nuestras recetas está hecha con amor, tradición y la mejor calidad.</p><p>Nuestro compromiso es no solo crear pasteles que se vean increíbles, sino que su sabor se quede en tu memoria para siempre.</p>'

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Image
    content = content.replace('img/logo-placeholder.png', 'img/logo.jpeg')
    
    # 2. Add 'Mi Cuenta' to Navbar
    # Search for <a href="contacto.html" ...>Contáctanos</a> and insert Mi cuenta before or after.
    if 'login.html' not in content:
        # For index
        content = content.replace('<a href="contacto.html">Contáctanos</a>', '<a href="contacto.html">Contáctanos</a>\n                <a href="login.html" class="btn btn-primary" style="padding: 0.4rem 1.2rem; margin-left:1rem;">Mi Cuenta</a>')
        content = content.replace('<a href="contacto.html" class="active">Contáctanos</a>', '<a href="contacto.html" class="active">Contáctanos</a>\n                <a href="login.html" class="btn btn-primary" style="padding: 0.4rem 1.2rem; margin-left:1rem;">Mi Cuenta</a>')
        
    # 3. Social Links in Footer
    # Replace Facebook
    content = re.sub(r'<a href="#"><i class="fab fa-facebook-f"></i></a>', f'<a href="{FACEBOOK_LINK}" target="_blank"><i class="fab fa-facebook-f"></i></a>', content)
    # Replace Instagram with TikTok
    content = re.sub(r'<a href="#"><i class="fab fa-instagram"></i></a>', f'<a href="{TIKTOK_LINK}" target="_blank"><i class="fab fa-tiktok"></i></a>', content)
    # Replace WhatsApp
    content = re.sub(r'<a href="#"><i class="fab fa-whatsapp"></i></a>', f'<a href="{WHATSAPP_LINK}" target="_blank"><i class="fab fa-whatsapp"></i></a>', content)
    
    # Contact content in footer and contact page
    content = content.replace('+52 (55) 1234-5678', PHONE_TEXT)
    content = content.replace('hola@pastelerialaestrella.com', EMAIL_TEXT)
    content = content.replace('Av. Principal #123, Ciudad', ADDRESS_TEXT)
    content = content.replace('Av. Principal #123, Colonia Centro<br>Ciudad de México, CDMX 01000', ADDRESS_TEXT)
    
    if file_path == 'index.html':
        # Replace history text
        old_history = '<p>En Pastelería La Estrella, creemos que cada celebración merece un postre excepcional. Llevamos más de 25 años perfeccionando nuestras recetas, utilizando mantequilla real, vainilla natural y chocolate premium.</p>\n                <p>Nuestro compromiso es no solo crear pasteles que se vean increíbles, sino que su sabor se quede en tu memoria para siempre.</p>'
        content = content.replace(old_history, HISTORY_TEXT)
        content = content.replace('Tradición y Calidad desde 1995', 'Tradición y Calidad desde 1999')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated HTML files.")
