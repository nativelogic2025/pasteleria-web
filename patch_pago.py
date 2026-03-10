import re
import os

filepath = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\pago.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the first script block that has components
script_replacement = """    <script src="js/components.js"></script>
    <script src="js/supabase.js"></script>
    <script src="js/main.js"></script>
    <script>
        // Check Auth
        if (localStorage.getItem('isLoggedIn')) {
            document.getElementById('navAccountBtn').textContent = "Mi Perfil";
        } else {
            alert("Por favor inicia sesión para completar el pago.");
            window.location.href = 'login.html';
        }

        // Toggles bank info
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'transferencia') {
                    document.getElementById('bankInfo').classList.add('active');
                } else {
                    document.getElementById('bankInfo').classList.remove('active');
                }
            });
        });

        // Load summary
        const currentOrderJson = localStorage.getItem('currentOrder');
        let orderData = {};

        if (!currentOrderJson) {
            document.getElementById('orderSummaryContent').innerHTML = "<p>No hay un pedido activo. Por favor <a href='crear-pedido.html' style='color:var(--color-primary);text-decoration:underline;'>regresa al formulario</a>.</p>";
            document.getElementById('btnConfirmar').disabled = true;
        } else {
            orderData = JSON.parse(currentOrderJson);

            // Build visual summary
            let summaryHTML = `
                <div class="summary-item"><span class="summary-label">Fecha Entrega:</span> <span>${orderData.fecha} a las ${orderData.hora}</span></div>
                <div class="summary-item"><span class="summary-label">Domicilio:</span> <span>${orderData.domicilio}</span></div>
                <div class="summary-item"><span class="summary-label">Producto:</span> <span>${orderData.nombreProducto} (${orderData.nombreVariante})</span></div>
            `;

            if (orderData.armado) {
                summaryHTML += `
                    <div class="summary-item"><span class="summary-label">Diseño:</span> <span>${orderData.armado}, ${orderData.pisos} piso(s), ${orderData.diseno}</span></div>
                `;
            }

            summaryHTML += `
                <div class="summary-item"><span class="summary-label">Sabor:</span> <span>${orderData.sabor}</span></div>
                <div class="summary-item"><span class="summary-label">Dedicatoria:</span> <span>${orderData.dedicatoria || 'N/A'}</span></div>
                <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
                <div class="summary-item"><span class="summary-label">Subtotal Producto:</span> <span>$${orderData.precioBase.toFixed(2)} MXN</span></div>
                <div class="summary-item"><span class="summary-label">Costo Flete:</span> <span>$${orderData.flete.toFixed(2)} MXN</span></div>
                <div class="summary-total"><span>Total Completo:</span> <span>$${orderData.total.toFixed(2)} MXN</span></div>
                <div class="summary-item" style="color: #d35400; font-weight:600; margin-top:0.5rem;"><span>Anticipo a pagar hoy:</span> <span>$${orderData.deposito.toFixed(2)} MXN</span></div>
            `;

            document.getElementById('orderSummaryContent').innerHTML = summaryHTML;
        }

        // GENERAR PDF Y FINALIZAR
        document.getElementById('btnConfirmar').addEventListener('click', async () => {
            const method = document.querySelector('input[name="payment"]:checked').value;
            orderData.paymentMethod = method;

            // Generate Folio Randomly (in a real app, from backend sequence)
            const folio = 'EST-' + Math.floor(10000 + Math.random() * 90000);
            
            // UI Loading state
            document.getElementById('checkoutUI').style.display = 'none';
            document.getElementById('pdfLoading').style.display = 'block';

            try {
                // 1. Crear el Pedido en Supabase
                const datosPedidoBase = {
                    folio: folio,
                    id_cliente: localStorage.getItem('userId') || null, // Assuming userId is stored, may be null
                    fecha_entrega: orderData.fecha,
                    hora_entrega: orderData.hora,
                    tipo_entrega: orderData.flete > 0 ? 'domicilio' : 'sucursal',
                    estado: 'pendiente',
                    total: orderData.total,
                    observaciones: `Domicilio: ${orderData.domicilio}. Sabor: ${orderData.sabor}. Decoración: ${orderData.descripcion}. Dedicatoria: ${orderData.dedicatoria}. Estructura: ${orderData.armado || ''} ${orderData.pisos || ''} ${orderData.diseno || ''}`
                };

                const pedidoGuardado = await crearPedidoOnline(datosPedidoBase);
                
                if (pedidoGuardado) {
                    const idPedido = pedidoGuardado[0] ? pedidoGuardado[0].id_pedido : null;
                    
                    if (idPedido) {
                        // 2. Insertar Detalle
                        const detalleData = {
                            id_pedido: idPedido,
                            id_variante: orderData.idVariante,
                            cantidad: 1,
                            precio_unitario: orderData.precioBase
                        };
                        await crearDetallePedidoOnline(detalleData);

                        // 3. Insertar Pago (Anticipo)
                        const pagoData = {
                            id_pedido: idPedido,
                            metodo_pago: method === 'transferencia' ? 'transferencia' : 'efectivo_sucursal',
                            estado_pago: 'pendiente',
                            monto: orderData.deposito
                        };
                        await crearPagoPedidoOnline(pagoData);
                    }
                }

                // Generar PDF del ticket
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                doc.setFillColor(140, 85, 53);
                doc.rect(0, 0, 210, 30, 'F');

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(22);
                doc.text("PASTELERIA LA ESTRELLA", 105, 20, null, null, "center");

                doc.setTextColor(51, 51, 51);
                doc.setFontSize(16);
                doc.text(`TICKET DE PEDIDO: ${folio}`, 105, 45, null, null, "center");

                doc.setFontSize(12);
                doc.text("Datos del Cliente y Entrega", 20, 60);
                doc.line(20, 63, 190, 63);

                const userEmail = localStorage.getItem('userEmail') || 'Cliente Invitado';
                doc.setFontSize(10);
                doc.text(`Correo Cuenta: ${userEmail}`, 20, 70);
                doc.text(`Fecha y Hora: ${orderData.fecha} / ${orderData.hora}`, 20, 77);
                doc.text(`Domicilio: ${orderData.domicilio}`, 20, 84);

                doc.setFontSize(12);
                doc.text("Detalles del Producto", 20, 100);
                doc.line(20, 103, 190, 103);

                doc.setFontSize(10);
                doc.text(`Producto: ${orderData.nombreProducto} (${orderData.nombreVariante})`, 20, 110);
                doc.text(`Sabor: ${orderData.sabor}`, 20, 117);
                if (orderData.armado) {
                    doc.text(`Estructura: ${orderData.armado}, ${orderData.pisos} piso(s), ${orderData.diseno}`, 20, 124);
                }
                doc.text(`Dedicatoria: ${orderData.dedicatoria || 'Ninguna'}`, 20, 131);
                doc.text(`Notas Extra: ${orderData.descripcion || 'Ninguna'}`, 20, 138);

                doc.setFontSize(12);
                doc.text("Cotización", 20, 155);
                doc.line(20, 158, 190, 158);

                doc.setFontSize(10);
                doc.text(`Subtotal: $${orderData.precioBase.toFixed(2)} MXN`, 20, 165);
                doc.text(`Flete: $${orderData.flete.toFixed(2)} MXN`, 20, 172);

                doc.setFontSize(14);
                doc.text(`TOTAL: $${orderData.total.toFixed(2)} MXN`, 20, 182);

                doc.setFontSize(12);
                doc.setTextColor(211, 84, 0);
                doc.text(`Anticipo (50%): $${orderData.deposito.toFixed(2)} MXN`, 20, 190);

                doc.setTextColor(51, 51, 51);
                doc.setFontSize(10);
                const pagoTexto = method === 'sucursal' ? "Pago a realizar en Sucursal" : "Pago mediante Transferencia/Depósito (BBVA Cta: 0123456789)";
                doc.text(`Método seleccionado: ${pagoTexto}`, 20, 205);

                doc.setFontSize(10);
                doc.text("¡Gracias por confiar en nosotros! Presenta este folio al recoger tu pedido.", 105, 230, null, null, "center");

                const pdfDataUri = doc.output('datauristring');
                orderData.pdf = pdfDataUri;

                let orders = JSON.parse(localStorage.getItem('ordersList')) || [];
                orders.push(orderData);
                localStorage.setItem('ordersList', JSON.stringify(orders));

                localStorage.removeItem('currentOrder');

                setTimeout(() => {
                    alert(`¡Pedido Confirmado (Guardado en DB)! Tu folio es ${folio}. Redirigiendo a seguimiento.`);
                    window.location.href = `ver-pedido.html?folio=${folio}`;
                }, 1000);

            } catch (error) {
                console.error("Error al procesar pago/pedido", error);
                alert("Hubo un error al procesar tu pedido. Intenta nuevamente.");
                document.getElementById('checkoutUI').style.display = 'grid';
                document.getElementById('pdfLoading').style.display = 'none';
            }
        });
    </script>
</body>
"""

content = re.sub(r'    <script src="js/components\.js"></script>.*?</body>', script_replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied to pago.html")
