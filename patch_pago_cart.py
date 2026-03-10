import re

filepath = r'C:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB\pago.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

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

        // Global variables
        let cartItems = [];
        let grandTotal = 0;
        let subtotal = 0;
        let deposit = 0;
        let shipping = 0;
        let primaryDeliveryInfo = { fecha: '', hora: '', domicilio: '' };
        const idCarrito = localStorage.getItem('carritoActivo');

        document.addEventListener('DOMContentLoaded', async () => {
            if (!idCarrito) {
                document.getElementById('orderSummaryContent').innerHTML = "<p>No hay un carrito activo. Por favor <a href='carrito.html' style='color:var(--color-primary);text-decoration:underline;'>regresa al carrito</a>.</p>";
                document.getElementById('btnConfirmar').disabled = true;
                return;
            }

            try {
                cartItems = await obtenerItemsCarrito(idCarrito);
                
                if(!cartItems || cartItems.length === 0) {
                    document.getElementById('orderSummaryContent').innerHTML = "<p>El carrito está vacío.</p>";
                    document.getElementById('btnConfirmar').disabled = true;
                    return;
                }

                let itemsHTML = ``;
                
                cartItems.forEach(item => {
                    const prodName = item.productos?.nombre || 'Producto';
                    const varName = item.producto_variantes?.tamaño || item.id_variante;
                    const itemTotal = parseFloat(item.cantidad) * parseFloat(item.precio_unitario);
                    subtotal += itemTotal;
                    
                    const obsInfo = item.observaciones ? JSON.parse(item.observaciones) : {};
                    // Inherit delivery info from first item that has it
                    if(!primaryDeliveryInfo.domicilio && obsInfo.domicilio) {
                        primaryDeliveryInfo.domicilio = obsInfo.domicilio;
                        primaryDeliveryInfo.fecha = obsInfo.fecha;
                        primaryDeliveryInfo.hora = obsInfo.hora;
                    }

                    itemsHTML += `
                        <div class="summary-item" style="border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:5px;">
                            <span class="summary-label">${item.cantidad}x ${prodName} (${varName}):</span> 
                            <span>$${itemTotal.toFixed(2)}</span>
                        </div>
                    `;
                });

                // Assume $50 mxn for shipping if the user has requested home delivery in their items
                shipping = primaryDeliveryInfo.domicilio && primaryDeliveryInfo.domicilio.length > 5 ? 50 : 0;
                grandTotal = subtotal + shipping;
                deposit = grandTotal / 2;

                let summaryHTML = `
                    <div style="margin-bottom: 1rem;"><strong>Entrega:</strong> ${primaryDeliveryInfo.domicilio ? `${primaryDeliveryInfo.fecha} ${primaryDeliveryInfo.hora} - ${primaryDeliveryInfo.domicilio}` : 'Recoger en sucursal'}</div>
                    ${itemsHTML}
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
                    <div class="summary-item"><span class="summary-label">Subtotal Artículos:</span> <span>$${subtotal.toFixed(2)} MXN</span></div>
                    <div class="summary-item"><span class="summary-label">Costo Flete:</span> <span>$${shipping.toFixed(2)} MXN</span></div>
                    <div class="summary-total"><span>Total Completo:</span> <span>$${grandTotal.toFixed(2)} MXN</span></div>
                    <div class="summary-item" style="color: #d35400; font-weight:600; margin-top:0.5rem;"><span>Anticipo a pagar hoy:</span> <span>$${deposit.toFixed(2)} MXN</span></div>
                `;

                document.getElementById('orderSummaryContent').innerHTML = summaryHTML;

            } catch(e) {
                console.error(e);
                document.getElementById('orderSummaryContent').innerHTML = "<p>Error al cargar el resumen de tu carrito.</p>";
            }
        });

        // GENERAR ORDEN Y PDF
        document.getElementById('btnConfirmar').addEventListener('click', async () => {
            if(!cartItems || cartItems.length === 0) return;

            const method = document.querySelector('input[name="payment"]:checked').value;
            const folio = 'EST-' + Math.floor(10000 + Math.random() * 90000);
            
            document.getElementById('checkoutUI').style.display = 'none';
            document.getElementById('pdfLoading').style.display = 'block';

            try {
                // 1. Crear el Pedido Maestro
                const datosPedidoBase = {
                    folio: folio,
                    id_cliente: localStorage.getItem('userId') || null, 
                    fecha_entrega: primaryDeliveryInfo.fecha || null,
                    hora_entrega: primaryDeliveryInfo.hora || null,
                    tipo_entrega: shipping > 0 ? 'domicilio' : 'sucursal',
                    estado: 'pendiente',
                    total: grandTotal,
                    observaciones: `Domicilio: ${primaryDeliveryInfo.domicilio || 'N/A'}`
                };

                const pedidoGuardado = await crearPedidoOnline(datosPedidoBase);
                
                if (pedidoGuardado && pedidoGuardado[0]) {
                    const idPedido = pedidoGuardado[0].id_pedido;
                    
                    // 2. Insertar Detalle desde carrito
                    for (const item of cartItems) {
                         const obsInfo = item.observaciones ? JSON.parse(item.observaciones) : {};
                         const detalleData = {
                            id_pedido: idPedido,
                            id_variante: item.id_variante,
                            cantidad: item.cantidad,
                            precio_unitario: item.precio_unitario,
                            sabor: item.sabor,
                            dedicatoria: item.dedicatoria,
                            observaciones: `Armado: ${obsInfo.armado||''} ${obsInfo.pisos||''} ${obsInfo.diseno||''}. Extras: ${obsInfo.descripcion||''}`
                        };
                        await crearDetallePedidoOnline(detalleData);
                    }

                    // 3. Insertar Pago (Anticipo)
                    const pagoData = {
                        id_pedido: idPedido,
                        metodo_pago: method === 'transferencia' ? 'transferencia' : 'efectivo_sucursal',
                        estado_pago: 'pendiente',
                        monto: deposit
                    };
                    await crearPagoPedidoOnline(pagoData);
                    
                    // 4. Completar el carrito
                    await completarCarrito(idCarrito);
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
                doc.text(`Fecha y Hora: ${primaryDeliveryInfo.fecha || 'N/A'} / ${primaryDeliveryInfo.hora || 'N/A'}`, 20, 77);
                doc.text(`Domicilio: ${primaryDeliveryInfo.domicilio || 'Recoger en sucursal'}`, 20, 84);

                doc.setFontSize(12);
                doc.text("Detalles de Artículos", 20, 100);
                doc.line(20, 103, 190, 103);

                doc.setFontSize(10);
                let y = 110;
                cartItems.forEach(item => {
                    const prodName = item.productos?.nombre || 'Producto';
                    doc.text(`${item.cantidad}x ${prodName} - $${item.precio_unitario}`, 20, y);
                    y += 7;
                });

                y += 10;
                doc.setFontSize(12);
                doc.text("Cotización Financiera", 20, y);
                doc.line(20, y+3, 190, y+3);
                y += 10;

                doc.setFontSize(10);
                doc.text(`Subtotal: $${subtotal.toFixed(2)} MXN`, 20, y);
                y += 7;
                doc.text(`Flete: $${shipping.toFixed(2)} MXN`, 20, y);
                y += 10;
                doc.setFontSize(14);
                doc.text(`TOTAL: $${grandTotal.toFixed(2)} MXN`, 20, y);
                y += 8;
                doc.setFontSize(12);
                doc.setTextColor(211, 84, 0);
                doc.text(`Anticipo (50%): $${deposit.toFixed(2)} MXN`, 20, y);
                y += 15;

                doc.setTextColor(51, 51, 51);
                doc.setFontSize(10);
                const pagoTexto = method === 'sucursal' ? "Pago a realizar en Sucursal" : "Pago mediante Transferencia/Depósito (BBVA Cta: 0123456789)";
                doc.text(`Método seleccionado: ${pagoTexto}`, 20, y);
                
                doc.text("¡Gracias por confiar en nosotros! Presenta este folio al recoger tu pedido.", 105, 280, null, null, "center");

                const pdfDataUri = doc.output('datauristring');
                
                // Add to simple local history
                const orderData = {
                    folio: folio,
                    fecha: primaryDeliveryInfo.fecha,
                    pdf: pdfDataUri,
                    total: grandTotal
                };
                let orders = JSON.parse(localStorage.getItem('ordersList')) || [];
                orders.push(orderData);
                localStorage.setItem('ordersList', JSON.stringify(orders));

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
</body>"""

content = re.sub(r'    <script src="js/components\.js"></script>.*?</body>', script_replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch pago.html done")
