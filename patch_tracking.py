import re

filepath = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\ver-pedido.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

script_replacement = """    <script src="js/components.js"></script>
    <script src="js/supabase.js"></script>
    <script src="js/main.js"></script>
    <script>
        // Check Auth visual
        if (localStorage.getItem('isLoggedIn')) {
            document.getElementById('navAccountBtn').textContent = "Mi Perfil";
        }

        const searchBtn = document.getElementById('searchBtn');
        const orderInput = document.getElementById('orderNumber');
        const orderResult = document.getElementById('orderResult');
        const displayOrder = document.getElementById('displayOrder');
        const displayDate = document.getElementById('displayDate');
        const errorMsg = document.getElementById('errorMsg');
        const pdfViewer = document.getElementById('pdfViewer');
        const downloadBtn = document.getElementById('downloadBtn');

        let currentPdfDataUri = "";

        // Check if coming from payment
        const urlParams = new URLSearchParams(window.location.search);
        const urlFolio = urlParams.get('folio');

        if (urlFolio) {
            orderInput.value = urlFolio;
            ejecutarBusqueda(urlFolio);
        }

        searchBtn.addEventListener('click', () => {
            const val = orderInput.value.trim().toUpperCase();
            if (val.length > 3) {
                ejecutarBusqueda(val);
            } else {
                alert('Folio inválido.');
            }
        });

        async function ejecutarBusqueda(folio) {
            searchBtn.textContent = 'Buscando en BD...';
            searchBtn.disabled = true;
            searchBtn.style.opacity = '0.7';
            errorMsg.style.display = 'none';
            orderResult.classList.remove('active');

            try {
                // Fetch direct from Supabase
                const orderData = await buscarPedidoPorFolio(folio);

                if (orderData) {
                    displayOrder.textContent = orderData.folio;
                    displayDate.textContent = orderData.fecha_entrega ? `${orderData.fecha_entrega} a las ${orderData.hora_entrega || ''}` : '--';
                    
                    // Logic to set the timeline steps (mocked visual logic based on DB enum 'pendiente', 'pagado', 'enviado', etc.)
                    const steps = document.querySelectorAll('.step');
                    steps.forEach(s => { s.classList.remove('active', 'done'); });

                    if(orderData.estado === 'pendiente') {
                        steps[0].classList.add('active'); // Recibido
                    } else if(orderData.estado === 'completado') {
                        steps[0].classList.add('done');
                        steps[1].classList.add('done'); // Preparando
                        steps[2].classList.add('done'); // Finalizado
                        steps[3].classList.add('active'); // En Entrega
                    } else {
                        // Generic intermediate logic for UI
                         steps[0].classList.add('done');
                         steps[1].classList.add('active');
                    }

                    // For the PDF, since we don't store it in the DB yet, we look for a local fallback
                    const localOrders = JSON.parse(localStorage.getItem('ordersList')) || [];
                    const localMatch = localOrders.find(o => o.folio === folio);
                    if (localMatch && localMatch.pdf) {
                        pdfViewer.src = localMatch.pdf;
                        pdfViewer.style.display = 'block';
                        currentPdfDataUri = localMatch.pdf;
                    } else {
                         pdfViewer.style.display = 'none';
                         currentPdfDataUri = "";
                    }

                    orderResult.classList.add('active');
                } else {
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                errorMsg.textContent = "Error de conexión al buscar.";
                errorMsg.style.display = 'block';
            } finally {
                searchBtn.textContent = 'Buscar Folio';
                searchBtn.disabled = false;
                searchBtn.style.opacity = '1';
            }
        }

        // Force download link for the PDF
        downloadBtn.addEventListener('click', () => {
            if (currentPdfDataUri) {
                const link = document.createElement("a");
                link.href = currentPdfDataUri;
                link.download = `${displayOrder.textContent}_Ticket.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("El PDF ya no se encuentra disponible.");
            }
        });

    </script>
</body>"""

# Replace script using regex dots
content = re.sub(r'    <script src="js/components.js"></script>\n    <script src="js/main.js"></script>\n    <script>.*?</body>', script_replacement, content, flags=re.DOTALL)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch ver-pedido.html done")
