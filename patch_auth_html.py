import re

def patch_file(filepath, search_regex, replace_text):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(search_regex, replace_text, content, flags=re.DOTALL)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Patch registro.html
registro_path = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\registro.html'
registro_search = r'    <script src="js/components.js"></script>\n    <script src="js/main.js"></script>\n    <script>\n        document\.getElementById\(\'registerForm\'\)\.addEventListener\(\'submit\', function \(e\) \{.*?    </script>'
registro_replace = """    <script src="js/components.js"></script>
    <script src="js/supabase.js"></script>
    <script src="js/main.js"></script>
    <script>
        document.getElementById('registerForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            btn.textContent = 'Registrando...';
            btn.disabled = true;

            const datosCliente = {
                nombre: document.getElementById('nombre').value.trim(),
                apellidos: document.getElementById('apellidos').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            };

            try {
                await registrarCliente(datosCliente);
                alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
                window.location.href = 'login.html';
            } catch (error) {
                console.error(error);
                alert("Error al registrar cuenta: " + error.message);
                btn.textContent = 'Registrarme';
                btn.disabled = false;
            }
        });
    </script>"""
patch_file(registro_path, registro_search, registro_replace)

# Patch login.html
login_path = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\login.html'
login_search = r'    <script src="js/components.js"></script>\n    <script src="js/main.js"></script>\n    <script>\n        document\.getElementById\(\'loginForm\'\)\.addEventListener\(\'submit\', function \(e\) \{.*?    </script>'
login_replace = """    <script src="js/components.js"></script>
    <script src="js/supabase.js"></script>
    <script src="js/main.js"></script>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            btn.textContent = 'Verificando...';
            btn.disabled = true;
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                const user = await loginCliente(email, password);
                
                if (user) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', user.email);
                    localStorage.setItem('userId', user.id_cliente);
                    localStorage.setItem('userName', user.nombre);
                    window.location.href = 'crear-pedido.html';
                } else {
                    alert('Correo electrónico o contraseña incorrectos.');
                    btn.textContent = 'Iniciar Sesión';
                    btn.disabled = false;
                }
            } catch (error) {
                console.error(error);
                alert("Error de conexión al iniciar sesión.");
                btn.textContent = 'Iniciar Sesión';
                btn.disabled = false;
            }
        });
    </script>"""
patch_file(login_path, login_search, login_replace)

print("Patch login and register done")
