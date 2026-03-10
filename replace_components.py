import os
import re

directory = r"c:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB"

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace Header
        content = re.sub(r'<!-- Header / Navbar -->\s*<header[^>]*>.*?</header>', '<header-component></header-component>', content, flags=re.DOTALL|re.IGNORECASE)
        content = re.sub(r'<header[^>]*>.*?</header>', '<header-component></header-component>', content, flags=re.DOTALL|re.IGNORECASE)

        # Replace Footer
        content = re.sub(r'<!-- Footer -->\s*<footer[^>]*>.*?</footer>', '<footer-component></footer-component>', content, flags=re.DOTALL|re.IGNORECASE)
        content = re.sub(r'<footer[^>]*>.*?</footer>', '<footer-component></footer-component>', content, flags=re.DOTALL|re.IGNORECASE)
        
        # Add script include if not present
        if '<script src="js/components.js"></script>' not in content:
            content = content.replace('<script src="js/main.js"></script>', '<script src="js/components.js"></script>\n    <script src="js/main.js"></script>')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
