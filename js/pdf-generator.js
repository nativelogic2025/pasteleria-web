/**
 * PDF Generator logic separated for reuse
 * Depends on jspdf.umd.min.js being loaded in the HTML
 */

// Helper to load image as base64 for PDF
function getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg"));
        };
        img.onerror = () => resolve(null); // Fallback to null if image fails
        img.crossOrigin = "Anonymous";
        img.src = url;
    });
}

/**
 * Generates the order receipt as a Data URI string using jsPDF.
 * @param {Object} orderData - Master order record (pedidos_online)
 * @param {Array} detalles - Order items (detalle_pedido_online joined with productos/variantes)
 * @param {Object} cliente - Customer record (clientes)
 * @param {Object} pago - Payment record (pagos_pedido_online)
 * @returns {Promise<string>} Base64 data URI of the generated PDF
 */
async function generarPDFDocumento(orderData, detalles, cliente, pago) {
    // Preload logo
    const logoBase64 = await getBase64ImageFromURL('img/logo.jpeg');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Colores
    const colorPrimario = [140, 85, 53];      // #8C5535
    const colorFondo = [252, 245, 238];       // #FCF5EE
    const colorTexto = [51, 51, 51];          // #333333

    let y = 0;

    // --- 1. Encabezado (Header) ---
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    
    // Izquierda (Logo)
    if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 15, 5, 25, 25);
    } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("[LOGO]", 15, 20);
    }

    // Centro
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PASTELERIA LA ESTRELLA", 105, 16, null, null, "center");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Pedidos Personalizados", 105, 22, null, null, "center");

    // Derecha
    doc.setFontSize(8);
    doc.text("Tel: 55 1572 3305", 195, 13, null, null, "right");
    doc.text("pastlria.la.estrella@gmail.com", 195, 18, null, null, "right");
    doc.text("Tizayuca, Hidalgo", 195, 23, null, null, "right");
    y = 45;

    // --- 2. Información del Pedido ---
    doc.setTextColor(...colorTexto);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("COMPROBANTE DE PEDIDO", 105, y, null, null, "center");
    y += 8;

    doc.setFillColor(...colorFondo);
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, y, 180, 20, 'FD');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Format date from DB string (e.g. 2024-03-21T10:00:00)
    let fechaCreacionTexto = '';
    if (orderData.created_at) {
        fechaCreacionTexto = new Date(orderData.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } else {
        fechaCreacionTexto = new Date().toLocaleDateString('es-MX');
    }

    const estadoFiltro = orderData.estado || 'Pendiente';
    const pagoFiltro = pago && pago.metodo_pago === 'transferencia' ? 'Transferencia' : 'Sucursal';
    
    doc.text(`Folio del Pedido: ${orderData.folio}`, 20, y + 7);
    doc.text(`Fecha de creación: ${fechaCreacionTexto}`, 20, y + 14);
    doc.text(`Estado del pedido: ${estadoFiltro.charAt(0).toUpperCase() + estadoFiltro.slice(1)}`, 110, y + 7);
    doc.text(`Método de pago: ${pagoFiltro}`, 110, y + 14);
    y += 28;

    // --- 3. Información del Cliente ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorPrimario);
    doc.text("DATOS DEL CLIENTE", 15, y);
    doc.line(15, y + 2, 195, y + 2);
    y += 7;

    doc.setTextColor(...colorTexto);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const userName = cliente && cliente.nombre ? `${cliente.nombre} ${cliente.apellidos || ''}` : 'Cliente Invitado';
    const userEmail = cliente && cliente.correo ? cliente.correo : 'No registrado';
    const userPhone = cliente && cliente.telefono ? cliente.telefono : 'No registrado';
    
    doc.text(`Nombre del cliente: ${userName.trim()}`, 15, y);
    doc.text(`Correo electrónico: ${userEmail}`, 15, y + 5);
    doc.text(`Teléfono: ${userPhone}`, 15, y + 10);
    y += 18;

    // --- 4. Información de Entrega ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorPrimario);
    doc.text("DETALLES DE ENTREGA", 15, y);
    doc.line(15, y + 2, 195, y + 2);
    y += 7;

    doc.setTextColor(...colorTexto);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const tipoEntregaText = orderData.tipo_entrega === 'domicilio' ? 'Domicilio' : 'Recolección en sucursal';
    
    // Extract address from observaciones if it starts with "Domicilio:" (to match pago.html format)
    let direccionTexto = 'No aplicable';
    if (orderData.tipo_entrega === 'domicilio') {
        if (orderData.observaciones && orderData.observaciones.startsWith('Domicilio:')) {
            direccionTexto = orderData.observaciones.replace('Domicilio:', '').trim();
        } else if (orderData.observaciones) {
            direccionTexto = orderData.observaciones;
        } else {
            direccionTexto = 'Dirección no especificada';
        }
    } else if (orderData.tipo_entrega === 'sucursal' || orderData.observaciones === 'Domicilio: Sucursal') {
         direccionTexto = 'Recoger en Sucursal';
    }

    doc.text(`Tipo de entrega: ${tipoEntregaText}`, 15, y);
    doc.text(`Fecha de entrega: ${orderData.fecha_entrega || 'N/A'}`, 15, y + 5);
    doc.text(`Hora de entrega: ${orderData.hora_entrega || 'N/A'}`, 15, y + 10);
    doc.text(`Dirección de entrega: ${direccionTexto}`, 15, y + 15);
    y += 24;

    // --- 5. Detalles del Pedido (Tabla) ---
    doc.setFillColor(...colorPrimario);
    doc.rect(15, y, 180, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    
    doc.text("Cant", 18, y + 4);
    doc.text("Producto", 30, y + 4);
    doc.text("Tamaño", 95, y + 4);
    doc.text("Sabor", 125, y + 4);
    doc.text("Precio", 155, y + 4);
    doc.text("Subtotal", 175, y + 4);
    y += 10;

    doc.setTextColor(...colorTexto);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    let subtotalCalculado = 0;

    if (detalles && detalles.length > 0) {
        detalles.forEach(item => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            
            const prodName = (item.productos ? item.productos.nombre : 'Producto').substring(0, 30);
            const varName = (item.producto_variantes && item.producto_variantes.tamaño ? item.producto_variantes.tamaño : (item.id_variante || 'Normal')).substring(0, 15);
            const itemTotal = parseFloat(item.cantidad) * parseFloat(item.precio_unitario);
            subtotalCalculado += itemTotal;
            const saborTxt = item.sabor ? item.sabor.substring(0, 15) : 'N/A';
            
            doc.text(`${item.cantidad}`, 18, y);
            doc.text(`${prodName}`, 30, y);
            doc.text(`${varName}`, 95, y);
            doc.text(`${saborTxt}`, 125, y);
            doc.text(`$${parseFloat(item.precio_unitario).toFixed(2)}`, 155, y);
            doc.text(`$${itemTotal.toFixed(2)}`, 175, y);
            
            doc.setDrawColor(220, 220, 220);
            doc.line(15, y + 2, 195, y + 2);
            
            y += 6;
            
            // --- 6. Detalles de Personalización (si aplica) ---
            let obsInfo = null;
            if (item.observaciones) {
                try {
                    obsInfo = JSON.parse(item.observaciones);
                } catch(e) {
                    obsInfo = { descripcion: item.observaciones };
                }
            }

            if(obsInfo || item.dedicatoria) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                
                let extrasLine = "";
                if(obsInfo?.armado) extrasLine += `Armado: ${obsInfo.armado} | `;
                if(obsInfo?.pisos) extrasLine += `Pisos: ${obsInfo.pisos} | `;
                if(obsInfo?.diseno) extrasLine += `Diseño: ${obsInfo.diseno} | `;
                if(item.dedicatoria) extrasLine += `Dedicatoria: ${item.dedicatoria} | `;
                if(obsInfo?.descripcion) extrasLine += `Extras: ${obsInfo.descripcion}`;
                
                if(extrasLine.length > 0) {
                    if(extrasLine.endsWith(" | ")) extrasLine = extrasLine.slice(0, -3);
                    
                    const splitExtras = doc.splitTextToSize(extrasLine, 150);
                    doc.text(splitExtras, 30, y - 2);
                    y += (splitExtras.length * 3);
                }
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(...colorTexto);
            }
        });
    }

    y += 2;

    // --- 7. Resumen Financiero ---
    if (y > 220) { doc.addPage(); y = 20; }
    
    // In db, total already includes shipping. We deduce shipping by finding the difference.
    const grandTotal = parseFloat(orderData.total) || 0;
    const shipping = Math.max(0, grandTotal - subtotalCalculado);
    const deposit = pago ? parseFloat(pago.monto) : (grandTotal / 2);

    doc.setFillColor(...colorFondo);
    doc.rect(115, y, 80, 35, 'F');
    doc.setFontSize(9);
    
    doc.text("Subtotal:", 120, y + 6);
    doc.text(`$${subtotalCalculado.toFixed(2)}`, 190, y + 6, null, null, "right");
    
    doc.text("Costo de envío:", 120, y + 11);
    doc.text(`$${shipping.toFixed(2)}`, 190, y + 11, null, null, "right");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 120, y + 17);
    doc.text(`$${grandTotal.toFixed(2)}`, 190, y + 17, null, null, "right");
    
    doc.setFontSize(9);
    doc.setTextColor(...colorPrimario);
    doc.text("Anticipo abonado (o requerido):", 120, y + 25);
    doc.text(`$${deposit.toFixed(2)}`, 190, y + 25, null, null, "right");
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorTexto);
    doc.text("Restante a pagar:", 120, y + 30);
    doc.text(`$${Math.max(0, grandTotal - deposit).toFixed(2)}`, 190, y + 30, null, null, "right");
    
    y += 45;

    // --- 8 & 9. QR y Avisos ---
    if (y > 200) { doc.addPage(); y = 20; }
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Muestra este código QR en sucursal para validar la entrega de tu pedido.", 105, y, null, null, "center");
    doc.text("Cancelaciones requieren un mínimo de 72 horas de anticipación.", 105, y + 4, null, null, "center");
    
    y += 10;
    
    // Generate QR URL pointing to admin-entrega.html
    let currentPath = window.location.pathname;
    let newPath = currentPath.substring(0, currentPath.lastIndexOf('/')) + '/admin-entrega.html';
    const qrText = encodeURIComponent(window.location.origin + newPath + '?folio=' + orderData.folio);
    const qrUrl = "https://quickchart.io/qr?text=" + qrText + "&size=150&margin=1";
    
    try {
        const qrBase64 = await getBase64ImageFromURL(qrUrl);
        if (qrBase64) {
            doc.addImage(qrBase64, 'PNG', 85, y, 40, 40);
        }
    } catch(e) {
        console.error("Error generando QR", e);
    }
    
    y += 45;
    
    const fechaCorta = new Date().toLocaleDateString('es-MX');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de impresión: ${fechaCorta}`, 105, y + 5, null, null, "center");

    // --- 10. Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for(var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 280, 210, 17, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text("Gracias por confiar en Pastelería La Estrella", 105, 286, null, null, "center");
        doc.text("www.pastelerialaestrella.com", 105, 292, null, null, "center");
    }

    return doc.output('datauristring');
}
