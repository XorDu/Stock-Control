// ============================================
// CONTROL FÁCIL - Sistema de Gestión de Inventario
// Frontend conectado a MySQL
// ============================================

// ============================================
// INICIALIZACIÓN
// ============================================

async function inicializarApp() {
    // Configurar fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('entrada-fecha').value = hoy;

    // Inyectar panel de usuarios si es Super Admin (Antes de configurar tabs)
    inyectarPanelUsuarios();

    // Configurar navegación de tabs
    configurarTabs();

    // Configurar formularios
    configurarFormularioEntrada();
    configurarFormularioSalida();

    // Configurar búsqueda
    configurarBusqueda();

    // Aplicar restricciones de rol (Operador no ve Entradas)
    aplicarPermisosRol();

    // Cargar datos del servidor
    await cargarDatosIniciales();
}

// ============================================
// PERMISOS Y ROLES
// ============================================

function aplicarPermisosRol() {
    const rol = sessionStorage.getItem('userRol');
    
    // Si es Usuario (us), solo puede ver: Salidas, Inventario, Lotes, Vencimientos
    if (rol === 'us') {
        // Ocultar pestañas no permitidas
        const tabEntradas = document.querySelector('.tab-btn[data-tab="entradas"]');
        if (tabEntradas) tabEntradas.style.display = 'none';
        
        const tabReporte = document.querySelector('.tab-btn[data-tab="reporte"]');
        if (tabReporte) tabReporte.style.display = 'none';
        
        // Cambiar vista inicial a Salidas
        const tabSalidas = document.querySelector('.tab-btn[data-tab="salidas"]');
        if (tabSalidas) tabSalidas.click();
        
        // Ocultar contenido de entradas
        const entradasContent = document.getElementById('entradas');
        if (entradasContent) entradasContent.style.display = 'none';
        
        // Ocultar formulario de entradas
        const formEntrada = document.getElementById('form-entrada');
        if (formEntrada) formEntrada.style.display = 'none';
        
        // Ocultar botón de eliminar entradas
        const botonesEliminar = document.querySelectorAll('.btn-delete');
        botonesEliminar.forEach(btn => btn.style.display = 'none');
        
        // Ocultar botón de eliminar en inventario
        const btnEliminarProducto = document.querySelectorAll('.btn-delete-small');
        btnEliminarProducto.forEach(btn => btn.style.display = 'none');
        
        // Ocultar Reporte
        const reporteContent = document.getElementById('reporte');
        if (reporteContent) reporteContent.style.display = 'none';
    }
}

async function cargarDatosIniciales() {
    const rol = sessionStorage.getItem('userRol');
    
    try {
        // Usuarios con rol "us" no pueden ver entradas ni reporte
        const promises = [
            renderizarSalidas(),
            renderizarInventario(),
            renderizarVencimientos(),
            actualizarResumen()
        ];
        
        // Agregar entradas solo si no es rol "us"
        if (rol !== 'us') {
            promises.push(renderizarEntradas());
        }
        
        await Promise.all(promises);
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarNotificacion('Error conectando al servidor', 'error');
    }
}

// ============================================
// NAVEGACIÓN DE TABS
// ============================================

function configurarTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const rol = sessionStorage.getItem('userRol');

    tabButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const tabName = this.getAttribute('data-tab');
            
            // Usuarios con rol "us" no pueden acceder a reporte
            if (rol === 'us' && tabName === 'reporte') {
                mostrarNotificacion('Acceso denegado: No tiene permisos para ver reportes', 'error');
                return;
            }

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');

            if (tabName === 'inventario') {
                await renderizarInventario();
                await actualizarResumen();
            } else if (tabName === 'lotes') {
                await renderizarTodosLotes();
            } else if (tabName === 'vencimientos') {
                await renderizarVencimientos();
            } else if (tabName === 'usuarios') {
                await renderizarUsuarios();
            } else if (tabName === 'reporte') {
                await renderizarReporte();
                configurarReporte();
            }
        });
    });
}

// ============================================
// FORMULARIO DE ENTRADAS
// ============================================

// Variable para controlar si el formulario está bloqueado por lote duplicado
let formularioBloqueadoPorLote = false;

function configurarFormularioEntrada() {
    const form = document.getElementById('form-entrada');
    const loteInput = document.getElementById('entrada-lote');
    const productoInput = document.getElementById('entrada-producto');
    
    // Variable para almacenar timeout de verificación
    let verificacionTimeout = null;
    
    // Función para verificar si el lote ya existe
    async function verificarLoteDuplicado() {
        const lote = loteInput.value.trim();
        const producto = productoInput.value.trim();
        
        if (!lote) {
            // Limpiar estado de error si el campo está vacío
            loteInput.classList.remove('input-error');
            const errorMsg = document.getElementById('lote-error-msg');
            if (errorMsg) errorMsg.remove();
            formularioBloqueadoPorLote = false;
            return;
        }
        
        try {
            const resultado = await apiGet(`/api/lotes/verificar?numero_lote=${encodeURIComponent(lote)}&producto_nombre=${encodeURIComponent(producto)}`);
            
            if (resultado.success && resultado.existe) {
                // El lote ya existe - mostrar error
                loteInput.classList.add('input-error');
                
                // Agregar mensaje de error si no existe
                let errorMsg = document.getElementById('lote-error-msg');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.id = 'lote-error-msg';
                    errorMsg.className = 'error-message';
                    errorMsg.style.color = '#dc3545';
                    errorMsg.style.fontSize = '12px';
                    errorMsg.style.marginTop = '5px';
                    loteInput.parentNode.appendChild(errorMsg);
                }
                
                const productoInfo = resultado.datos?.proveedor ? ` para el producto "${producto}"` : '';
                errorMsg.textContent = `⚠️ El lote "${lote}" ya está registrado${productoInfo}. Use un número de lote diferente.`;
                
                formularioBloqueadoPorLote = true;
            } else {
                // El lote no existe - limpiar error
                loteInput.classList.remove('input-error');
                const errorMsg = document.getElementById('lote-error-msg');
                if (errorMsg) errorMsg.remove();
                formularioBloqueadoPorLote = false;
            }
        } catch (error) {
            console.error('Error verificando lote:', error);
        }
    }
    
    // Verificar lote cuando el usuario deja de escribir (500ms después)
    loteInput.addEventListener('input', function() {
        if (verificacionTimeout) clearTimeout(verificacionTimeout);
        verificacionTimeout = setTimeout(verificarLoteDuplicado, 500);
    });
    
    // Verificar lote cuando el campo pierde foco
    loteInput.addEventListener('blur', function() {
        if (verificacionTimeout) clearTimeout(verificacionTimeout);
        verificarLoteDuplicado();
    });
    
    // Verificar lote cuando el producto cambia
    productoInput.addEventListener('change', function() {
        if (verificacionTimeout) clearTimeout(verificacionTimeout);
        if (loteInput.value.trim()) {
            verificacionTimeout = setTimeout(verificarLoteDuplicado, 300);
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const producto = document.getElementById('entrada-producto').value.trim();
        const cantidad = parseInt(document.getElementById('entrada-cantidad').value);
        const unidad = document.getElementById('entrada-unidad').value;
        const lote = document.getElementById('entrada-lote').value.trim();
        const proveedor = document.getElementById('entrada-proveedor').value.trim();
        const fecha = document.getElementById('entrada-fecha').value;
        const vencimiento = document.getElementById('entrada-vencimiento').value;

        // Verificar si el formulario está bloqueado por lote duplicado
        if (formularioBloqueadoPorLote) {
            mostrarNotificacion('El número de lote ya existe. Por favor use un número de lote único.', 'error');
            loteInput.focus();
            return;
        }

        if (cantidad <= 0) {
            mostrarNotificacion('La cantidad debe ser mayor a 0', 'error');
            return;
        }

        if (!vencimiento) {
            mostrarNotificacion('Debe ingresar la fecha de vencimiento', 'error');
            return;
        }

        const resultado = await apiPost('/api/entradas', {
            producto,
            cantidad,
            unidad,
            lote,
            proveedor,
            fecha,
            vencimiento
        });

        if (resultado.success) {
            mostrarNotificacion(`✓ Entrada registrada: ${cantidad} ${unidad} de ${producto}`, 'success');
            form.reset();
            document.getElementById('entrada-fecha').value = new Date().toISOString().split('T')[0];
            // Limpiar mensajes de error
            const errorMsg = document.getElementById('lote-error-msg');
            if (errorMsg) errorMsg.remove();
            formularioBloqueadoPorLote = false;
            await Promise.all([
                renderizarEntradas(),
                renderizarInventario(),
                renderizarSalidas()
            ]);
        } else {
            mostrarNotificacion('Error: ' + resultado.error, 'error');
        }
    });
}

async function renderizarEntradas() {
    const lista = document.getElementById('lista-entradas');
    
    try {
        const resultado = await apiGet('/api/entradas');
        
        if (!resultado.success) {
            // Error de la API - mostrar mensaje apropiado
            if (resultado.error && resultado.error.includes('Acceso denegado')) {
                lista.innerHTML = '<div class="empty-message">No tiene permisos para ver entradas</div>';
            } else {
                lista.innerHTML = '<div class="empty-message">Error al cargar entradas</div>';
            }
            return;
        }
        
        if (resultado.data.length === 0) {
            lista.innerHTML = '<div class="empty-message">No hay entradas registradas</div>';
            return;
        }

        lista.innerHTML = resultado.data.map(entrada => `
            <div class="entry-item">
                <div class="entry-header">
                    <span class="entry-product">${entrada.producto_nombre || entrada.producto}</span>
                    <span class="entry-badge badge-entrada">ENTRADA</span>
                </div>
                <div class="entry-details">
                    <div class="entry-detail">
                        <strong>Cantidad:</strong>
                        <span>${entrada.cantidad} ${entrada.unidad}</span>
                    </div>
                    <div class="entry-detail">
                        <strong>Lote:</strong>
                        <span>${entrada.lote || 'N/A'}</span>
                    </div>
                    <div class="entry-detail">
                        <strong>Proveedor:</strong>
                        <span>${entrada.proveedor || 'N/A'}</span>
                    </div>
                    <div class="entry-detail">
                        <strong>Fecha:</strong>
                        <span>${formatearFecha(entrada.fecha)}</span>
                    </div>
                </div>
                ${(sessionStorage.getItem('userRol') === 'admin' || sessionStorage.getItem('userRol') === 'super admin') ? `<button class="btn-delete" onclick="eliminarEntrada(${entrada.id})">🗑️ Eliminar</button>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error en renderizarEntradas:', error);
        lista.innerHTML = '<div class="empty-message">Error al cargar entradas</div>';
    }
}

async function eliminarEntrada(id) {
    const rol = sessionStorage.getItem('userRol');
    if (rol !== 'admin' && rol !== 'super admin') {
        mostrarNotificacion('Acceso denegado: Se requieren permisos de Administrador', 'error');
        return;
    }

    if (!confirm('¿Estás seguro de eliminar esta entrada? Se restará del stock.')) {
        return;
    }
    
    const resultado = await apiDelete(`/api/entradas/${id}`);
    
    if (resultado.success) {
        mostrarNotificacion('✓ Entrada eliminada correctamente', 'success');
        await Promise.all([
            renderizarEntradas(),
            renderizarInventario(),
            renderizarSalidas(),
            actualizarResumen()
        ]);
    } else {
        mostrarNotificacion('Error: ' + resultado.error, 'error');
    }
}

// ============================================
// FORMULARIO DE SALIDAS
// ============================================

function configurarFormularioSalida() {
    const form = document.getElementById('form-salida');
    const selectProducto = document.getElementById('salida-producto');
    const selectLote = document.getElementById('salida-lote');
    const inputCantidad = document.getElementById('salida-cantidad');
    const stockInfo = document.getElementById('stock-info');

    // Cargar productos al iniciar
    actualizarSelectoresProductos();

    selectProducto.addEventListener('change', async function() {
        const productoId = this.value;
        
        if (!productoId) {
            selectLote.disabled = true;
            selectLote.innerHTML = '<option value="">-- Primero seleccione un producto --</option>';
            inputCantidad.disabled = true;
            stockInfo.style.display = 'none';
            return;
        }

        // Obtener producto seleccionado
        const productos = await apiGet('/api/productos');
        const producto = productos.data.find(p => p.id == productoId);
        
        if (producto) {
            // Obtener lotes del producto
            const lotesRes = await apiGet('/api/lotes/producto/' + productoId);
            const lotesData = lotesRes.data || { producto: null, lotes: [] }; const lotes = lotesData.lotes || [];
            
            if (lotes.length > 0) {
                // Hay lotes disponibles - mostrar selector de lotes
                selectLote.disabled = false;
                selectLote.innerHTML = '<option value="">-- Seleccione un lote --</option>' +
                    lotes.map(lote => {
                        const cantidadLote = lote.stock || 0;
                        return '<option value="' + lote.id + '">' +
                            'Lote: ' + (lote.numero_lote || 'Sin numero') + 
                            ' (' + cantidadLote + ' ' + producto.unidad + ')' +
                            ' - Vence: ' + (lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString() : 'N/A') +
                            '</option>';
                    }).join('');
                
                // Listener para actualizar cantidad maxima segun lote seleccionado
                selectLote.addEventListener('change', async function() {
                    const loteId = this.value;
                    if (loteId) {
                        const loteSeleccionado = lotes.find(l => l.id == loteId);
                        if (loteSeleccionado) {
                            const cantidadLote = loteSeleccionado.stock || 0;
                            inputCantidad.max = cantidadLote;
                            inputCantidad.value = Math.min(inputCantidad.value, cantidadLote);
                            document.getElementById('stock-disponible').textContent = cantidadLote;
                        }
                    } else {
                        inputCantidad.max = producto.stock;
                        document.getElementById('stock-disponible').textContent = producto.stock;
                    }
                });
            } else {
                // No hay lotes - deshabilitar selector
                selectLote.disabled = true;
                selectLote.innerHTML = '<option value="">-- No hay lotes disponibles --</option>';
            }
            
            inputCantidad.disabled = false;
            inputCantidad.max = producto.stock;
            document.getElementById('stock-disponible').textContent = producto.stock;
            document.getElementById('stock-unidad').textContent = producto.unidad;
            stockInfo.style.display = 'block';
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const productoId = selectProducto.value;
        const loteId = selectLote.value;
        const cantidad = parseInt(inputCantidad.value);
        const motivo = document.getElementById('salida-motivo').value;

        if (!productoId) {
            mostrarNotificacion('Debe seleccionar un producto', 'error');
            return;
        }

        // Validar lote si el producto tiene lotes
        const lotesRes = await apiGet('/api/lotes/producto/' + productoId);
        const lotesData = lotesRes.data || { producto: null, lotes: [] };
        const lotes = lotesData.lotes || [];
        if (lotes.length > 0 && !loteId) {
            mostrarNotificacion('Debe seleccionar un lote', 'error');
            return;
        }

        if (cantidad <= 0 || isNaN(cantidad)) {
            mostrarNotificacion('La cantidad debe ser mayor a 0', 'error');
            return;
        }

        const resultado = await apiPost('/api/salidas', {
            producto_id: productoId,
            cantidad,
            motivo,
            lote_id: loteId || null
        });

        if (resultado.success) {
            const productos = await apiGet('/api/productos');
            const producto = productos.data.find(p => p.id == productoId);
            mostrarNotificacion('✓ Salida registrada: ' + cantidad + ' ' + (producto?.unidad || '') + ' de ' + producto?.nombre, 'success');
            form.reset();
            selectLote.disabled = true;
            selectLote.innerHTML = '<option value="">-- Primero seleccione un producto --</option>';
            inputCantidad.disabled = true;
            stockInfo.style.display = 'none';
            await Promise.all([
                renderizarSalidas(),
                renderizarInventario(),
                renderizarEntradas()
            ]);
        } else {
            mostrarNotificacion('Error: ' + resultado.error, 'error');
        }
    });
}

async function actualizarSelectoresProductos() {
    const selectProducto = document.getElementById('salida-producto');
    const resultado = await apiGet('/api/productos');
    
    if (!resultado.success || resultado.data.length === 0) {
        selectProducto.innerHTML = '<option value="">-- No hay productos --</option>';
        return;
    }

    selectProducto.innerHTML = '<option value="">-- Seleccione un producto --</option>' +
        resultado.data.map(producto => `
            <option value="${producto.id}">${producto.nombre} (${producto.stock} ${producto.unidad})</option>
        `).join('');
}

async function renderizarSalidas() {
    const lista = document.getElementById('lista-salidas');
    
    try {
        const resultado = await apiGet('/api/salidas');
        
        if (!resultado.success) {
            // Error de la API - mostrar mensaje apropiado
            if (resultado.error && resultado.error.includes('Acceso denegado')) {
                lista.innerHTML = '<div class="empty-message">No tiene permisos para ver salidas</div>';
            } else {
                lista.innerHTML = '<div class="empty-message">Error al cargar salidas</div>';
            }
            return;
        }
        
        if (resultado.data.length === 0) {
            lista.innerHTML = '<div class="empty-message">No hay salidas registradas</div>';
            return;
        }

        lista.innerHTML = resultado.data.map(salida => `
            <div class="entry-item">
                <div class="entry-header">
                    <span class="entry-product">${salida.producto_nombre || salida.producto}</span>
                    <span class="entry-badge badge-salida">SALIDA</span>
                </div>
                <div class="entry-details">
                    <div class="entry-detail">
                        <strong>Cantidad:</strong>
                        <span>${salida.cantidad}</span>
                    </div>
                    <div class="entry-detail">
                        <strong>Motivo:</strong>
                        <span>${obtenerTextoMotivo(salida.motivo)}</span>
                    </div>
                    <div class="entry-detail">
                        <strong>Fecha:</strong>
                        <span>${formatearFecha(salida.created_at)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error en renderizarSalidas:', error);
        lista.innerHTML = '<div class="empty-message">Error al cargar salidas</div>';
    }
}

// ============================================
// INVENTARIO
// ============================================

async function renderizarInventario(filtro = '') {
    const tbody = document.getElementById('tbody-inventario');
    const resultado = await apiGet('/api/inventario');
    
    let items = resultado.data || [];
    
    if (filtro) {
        items = items.filter(item =>
            item.nombre.toLowerCase().includes(filtro.toLowerCase())
        );
    }

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No hay productos en el inventario</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => {
        const stockClass = item.stock < 10 ? 'stock-low' : 'stock-ok';
        const lotesBadge = item.total_lotes > 0 
            ? `<span class="lotes-badge">${item.total_lotes} lote${item.total_lotes > 1 ? 's' : ''}</span>`
            : '<span class="lotes-badge-none">Sin lote</span>';
        
        return `
            <tr>
                <td><strong>${item.nombre}</strong></td>
                <td class="${stockClass}">${item.stock} ${item.unidad}</td>
                <td>${lotesBadge}</td>
                <td class="actions-cell">
                    <button class="btn-lotes" onclick="verLotesProducto(${item.id})" title="Ver lotes">📋 Lotes</button>
                    <button class="btn-pdf-small" onclick="imprimirPDFProducto(${item.id})" title="Imprimir PDF">📄</button>
                    ${sessionStorage.getItem('userRol') === 'super admin' ? `<button class="btn-delete-small" onclick="eliminarProducto(${item.id})" title="Eliminar">🗑️</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

async function eliminarProducto(id) {
    if (sessionStorage.getItem('userRol') !== 'super admin') {
        mostrarNotificacion('Acceso denegado: Solo el Super Admin puede eliminar productos', 'error');
        return;
    }

    if (!confirm('¿Estás seguro de eliminar este producto? Se eliminarán todas sus entradas asociadas.')) {
        return;
    }
    
    const resultado = await apiDelete(`/api/productos/${id}`);
    
    if (resultado.success) {
        mostrarNotificacion('✓ Producto eliminado correctamente', 'success');
        await Promise.all([
            renderizarEntradas(),
            renderizarInventario(),
            renderizarSalidas(),
            renderizarVencimientos(),
            actualizarResumen()
        ]);
    } else {
        mostrarNotificacion('Error: ' + resultado.error, 'error');
    }
}

async function actualizarResumen() {
    const resultado = await apiGet('/api/resumen');
    
    if (resultado.success) {
        document.getElementById('total-productos').textContent = resultado.data.total;
        document.getElementById('total-lotes').textContent = resultado.data.total_lotes;
        document.getElementById('productos-bajos').textContent = resultado.data.bajos;
    }
}

function configurarBusqueda() {
    const inputBusqueda = document.getElementById('buscar-inventario');
    inputBusqueda.addEventListener('input', function() {
        renderizarInventario(this.value);
    });
    
    // Configurar búsqueda de lotes
    const inputBusquedaLotes = document.getElementById('buscar-lotes');
    if (inputBusquedaLotes) {
        inputBusquedaLotes.addEventListener('input', function() {
            renderizarTodosLotes(this.value);
        });
    }
}

// ============================================
// LOTES
// ============================================

async function verLotesProducto(productoId) {
    // Cambiar a la pestaña de lotes
    const tabLotes = document.querySelector('.tab-btn[data-tab="lotes"]');
    if (tabLotes) {
        tabLotes.click();
    }
    
    // Mostrar vista de lotes del producto
    const resultado = await apiGet(`/api/lotes/producto/${productoId}`);
    
    if (!resultado.success || !resultado.data.producto) {
        mostrarNotificacion('Error al cargar los lotes del producto', 'error');
        return;
    }
    
    const { producto, lotes } = resultado.data;
    
    // Ocultar lista de todos los lotes y mostrar detalle del producto
    document.getElementById('todos-lotes-container').style.display = 'none';
    document.getElementById('lotes-producto-header').style.display = 'block';
    document.getElementById('tabla-lotes-producto').style.display = 'block';
    
    document.getElementById('lotes-producto-nombre').textContent = `Lotes de: ${producto.nombre} (Stock: ${producto.stock} ${producto.unidad})`;
    
    const tbody = document.getElementById('tbody-lotes-producto');
    
    if (lotes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Este producto no tiene lotes registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = lotes.map(lote => `
        <tr>
            <td><strong>${lote.numero_lote}</strong></td>
            <td>${lote.proveedor || '-'}</td>
            <td>${lote.stock || 0} ${producto.unidad}</td>
            <td>${formatearFecha(lote.fecha_vencimiento)}</td>
            <td class="actions-cell">
                <button class="btn-pdf-small" onclick="imprimirPDFLote(${lote.id})" title="Imprimir PDF">📄</button>
            </td>
        </tr>
    `).join('');
}

function volverAListaLotes() {
    document.getElementById('todos-lotes-container').style.display = 'block';
    document.getElementById('lotes-producto-header').style.display = 'none';
    document.getElementById('tabla-lotes-producto').style.display = 'none';
    
    // Recargar la lista de todos los lotes
    renderizarTodosLotes();
}

async function renderizarTodosLotes(filtro = '') {
    const tbody = document.getElementById('tbody-todos-lotes');
    const resultado = await apiGet('/api/lotes');
    
    let items = resultado.data || [];
    
    if (filtro) {
        const filtroLower = filtro.toLowerCase();
        items = items.filter(item =>
            (item.producto_nombre && item.producto_nombre.toLowerCase().includes(filtroLower)) ||
            (item.numero_lote && item.numero_lote.toLowerCase().includes(filtroLower)) ||
            (item.proveedor && item.proveedor.toLowerCase().includes(filtroLower))
        );
    }

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay lotes registrados</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td><strong>${item.producto_nombre}</strong></td>
            <td>${item.numero_lote}</td>
            <td>${item.proveedor || '-'}</td>
            <td>${item.stock || 0} ${item.unidad}</td>
            <td>${formatearFecha(item.fecha_vencimiento)}</td>
            <td class="actions-cell">
                <button class="btn-pdf-small" onclick="imprimirPDFLote(${item.id})" title="Imprimir PDF">📄</button>
            </td>
        </tr>
    `).join('');
}

function imprimirPDFLote(loteId) {
    mostrarNotificacion('Función de PDF por lote en desarrollo', 'info');
}

// ============================================
// VENCIMIENTOS
// ============================================

async function renderizarVencimientos() {
    const resultado = await apiGet('/api/vencimientos');
    
    if (!resultado.success) {
        document.getElementById('lista-vencidos').innerHTML = '<div class="empty-message">Error cargando datos</div>';
        document.getElementById('lista-proximos').innerHTML = '<div class="empty-message">Error cargando datos</div>';
        return;
    }

    const { vencidos, proximos } = resultado.data;

    const renderizarLista = (items, elementoId) => {
        const el = document.getElementById(elementoId);
        if (!items || items.length === 0) {
            el.innerHTML = '<div class="empty-message">No hay lotes</div>';
            return;
        }
        el.innerHTML = items.map(item => `
            <div class="vencimiento-item">
                <strong>${item.producto_nombre || 'Producto'}</strong>
                <small>Lote: ${item.numero_lote || 'N/A'} - Stock: ${item.stock || 0} ${item.unidad || 'unidades'} - Vence: ${formatearFecha(item.fecha_vencimiento)}</small>
            </div>
        `).join('');
    };

    renderizarLista(vencidos, 'lista-vencidos');
    renderizarLista(proximos, 'lista-proximos');
}

// ============================================
// REPORTE - Top de Ventas
// ============================================

async function renderizarReporte() {
    const container = document.getElementById('reporte-top');
    const resultado = await apiGet('/api/reporte/top-ventas');
    
    if (!resultado.success || !resultado.data || resultado.data.length === 0) {
        container.innerHTML = '<div class="empty-message">No hay ventas registradas</div>';
        return;
    }

    const items = resultado.data;
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th style="width: 80px; text-align: center;">#</th>
                    <th>Producto</th>
                    <th style="text-align: right;">Cantidad Vendida</th>
                    <th style="text-align: center;">Total Ventas</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item, index) => `
                    <tr>
                        <td style="text-align: center;">
                            <span class="report-rank rank-${index < 3 ? index + 1 : 'other'}">${index + 1}</span>
                        </td>
                        <td>
                            <span class="product-name">${item.producto_nombre}</span>
                        </td>
                        <td style="text-align: right;">
                            <span class="sales-count">${item.cantidad_total || 0}</span> ${item.unidad || 'unidades'}
                        </td>
                        <td style="text-align: center;">
                            ${item.total_ventas || 0}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function configurarReporte() {
    // Configurar el botón de descarga PDF
    const btnPdf = document.getElementById('btn-descargar-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', generarPDFReporte);
    }
}

async function generarPDFReporte() {
    try {
        // Obtener datos del reporte
        const resultado = await apiGet('/api/reporte/top-ventas');
        
        if (!resultado.success || !resultado.data || resultado.data.length === 0) {
            mostrarNotificacion('No hay datos para generar el reporte', 'error');
            return;
        }
        
        const items = resultado.data;
        
        // Crear PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // ==================== DISEÑO DEL PDF ====================
        
        // --- ENCABEZADO ---
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Control Fácil', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(50, 50, 50);
        doc.text('Top de Productos Más Vendidos', 105, 30, { align: 'center' });
        
        // Línea separadora
        doc.setDrawColor(102, 126, 234);
        doc.line(20, 35, 190, 35);
        
        // --- INFORMACIÓN DEL REPORTE ---
        let yPos = 50;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, 20, yPos);
        yPos += 8;
        doc.text(`Total de Productos en Top: ${items.length}`, 20, yPos);
        
        // --- TABLA DE TOP VENTAS ---
        yPos += 15;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text('RANKING DE VENTAS', 20, yPos);
        yPos += 10;
        
        // Encabezados de tabla
        doc.setFillColor(102, 126, 234);
        doc.rect(20, yPos - 5, 170, 10, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('#', 25, yPos + 2);
        doc.text('Producto', 40, yPos + 2);
        doc.text('Cantidad', 130, yPos + 2);
        doc.text('Ventas', 170, yPos + 2);
        
        yPos += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        
        // Filas de la tabla
        items.forEach((item, index) => {
            // Alternar colores de fila
            if (index % 2 === 0) {
                doc.setFillColor(248, 249, 250);
                doc.rect(20, yPos - 4, 170, 10, 'F');
            }
            
            // Número de ranking
            doc.setFont('helvetica', 'bold');
            doc.text(String(index + 1), 25, yPos + 2);
            doc.setFont('helvetica', 'normal');
            
            // Nombre del producto (truncar si es muy largo)
            let nombre = item.producto_nombre;
            if (nombre.length > 35) {
                nombre = nombre.substring(0, 35) + '...';
            }
            doc.text(nombre, 40, yPos + 2);
            
            // Cantidad
            doc.text(`${item.cantidad_total || 0} ${item.unidad || ''}`, 130, yPos + 2);
            
            // Total ventas
            doc.text(String(item.total_ventas || 0), 170, yPos + 2);
            
            yPos += 10;
            
            // Nueva página si es necesario
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                
                //重复表头
                doc.setFillColor(102, 126, 234);
                doc.rect(20, yPos - 5, 170, 10, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(255, 255, 255);
                doc.text('#', 25, yPos + 2);
                doc.text('Producto', 40, yPos + 2);
                doc.text('Cantidad', 130, yPos + 2);
                doc.text('Ventas', 170, yPos + 2);
                yPos += 12;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(50, 50, 50);
            }
        });
        
        // --- RESUMEN ---
        yPos += 10;
        
        // Calcular totales
        const totalCantidad = items.reduce((sum, item) => sum + (item.cantidad_total || 0), 0);
        const totalVentas = items.reduce((sum, item) => sum + (item.total_ventas || 0), 0);
        
        doc.setFillColor(102, 126, 234);
        doc.rect(20, yPos - 4, 170, 12, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL GENERAL', 25, yPos + 3);
        doc.text(`${totalCantidad} unidades`, 130, yPos + 3);
        doc.text(String(totalVentas), 170, yPos + 3);
        
        // --- PIE DE PÁGINA ---
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Sistema de Gestión de Inventario - Control Fácil', 105, 290, { align: 'center' });
        
        // Guardar PDF
        const nombreArchivo = `reporte_top_ventas_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        mostrarNotificacion('✓ Reporte PDF generado correctamente', 'success');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        mostrarNotificacion('Error al generar el reporte PDF', 'error');
    }
}

// Actualizar configurarTabs para incluir reporte

// ============================================
// UTILIDADES
// ============================================

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-VE');
}

function obtenerTextoMotivo(motivo) {
    const motivos = {
        'venta': 'Venta',
        'consumo': 'Consumo Interno',
        'merma': 'Merma/Pérdida',
        'devolucion': 'Devolución'
    };
    return motivos[motivo] || motivo;
}

function mostrarNotificacion(mensaje, tipo) {
    const notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.className = `notification ${tipo} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ============================================
// GESTIÓN DE USUARIOS (SUPER ADMIN)
// ============================================

function inyectarPanelUsuarios() {
    const rol = sessionStorage.getItem('userRol');
    if (rol !== 'super admin') return;

    // 1. Agregar botón de pestaña
    const tabContainer = document.querySelector('.tab-btn').parentElement;
    if (tabContainer && !document.querySelector('[data-tab="usuarios"]')) {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.setAttribute('data-tab', 'usuarios');
        btn.textContent = '👥 Usuarios';
        tabContainer.appendChild(btn);
    }

    // 2. Agregar contenido de la pestaña
    const contentContainer = document.querySelector('.tab-content').parentElement;
    if (contentContainer && !document.getElementById('usuarios')) {
        const div = document.createElement('div');
        div.id = 'usuarios';
        div.className = 'tab-content';
        div.innerHTML = `
            <div class="panel-header">
                <h2>Gestión de Usuarios</h2>
            </div>
            <div class="inventory-controls" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin-top: 0;">Crear Nuevo Usuario</h3>
                <form id="form-usuario" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <input type="text" id="usuario-nombre" placeholder="Nombre de usuario" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="password" id="usuario-clave" placeholder="Clave (Min 8, Mayús, Núm)" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 220px;">
                    <select id="usuario-rol" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="usuario">Operador</option>
                        <option value="admin">Administrador</option>
                        <option value="super admin">Super Admin</option>
                    </select>
                    <button type="submit" class="btn-primary" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">+ Crear</button>
                </form>
            </div>
            <div class="table-container">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f1f1f1; text-align: left;">
                            <th style="padding: 10px;">ID</th>
                            <th style="padding: 10px;">Usuario</th>
                            <th style="padding: 10px;">Rol</th>
                            <th style="padding: 10px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="lista-usuarios"></tbody>
                </table>
            </div>
        `;
        contentContainer.appendChild(div);

        // Configurar evento del formulario
        document.getElementById('form-usuario').addEventListener('submit', crearUsuario);
    }
}

async function renderizarUsuarios() {
    const tbody = document.getElementById('lista-usuarios');
    const resultado = await apiGet('/api/usuarios');

    if (!resultado.success) {
        tbody.innerHTML = '<tr><td colspan="4">Error cargando usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = resultado.data.map(u => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${u.id}</td>
            <td style="padding: 10px;"><strong>${u.nombre_de_usuario}</strong></td>
            <td style="padding: 10px;"><span class="entry-badge" style="background: #e2e8f0; color: #4a5568;">${u.rol}</span></td>
            <td style="padding: 10px;">
                ${u.nombre_de_usuario !== 'cantina' ? `<button onclick="eliminarUsuario(${u.id})" style="background: #fc8181; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>` : ''}
            </td>
        </tr>
    `).join('');
}

async function crearUsuario(e) {
    e.preventDefault();
    const nombre_de_usuario = document.getElementById('usuario-nombre').value.trim();
    const clave = document.getElementById('usuario-clave').value.trim();
    const rol = document.getElementById('usuario-rol').value;

    const resultado = await apiPost('/api/usuarios', { nombre_de_usuario, clave, rol });

    if (resultado.success) {
        mostrarNotificacion('✓ Usuario creado correctamente', 'success');
        document.getElementById('form-usuario').reset();
        renderizarUsuarios();
    } else {
        mostrarNotificacion('Error: ' + resultado.error, 'error');
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    const resultado = await apiDelete(`/api/usuarios/${id}`);
    
    if (resultado.success) {
        mostrarNotificacion('✓ Usuario eliminado', 'success');
        renderizarUsuarios();
    } else {
        mostrarNotificacion('Error: ' + resultado.error, 'error');
    }
}

// ============================================
// LOGOUT
// ============================================

function configurarLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('userRol');
            sessionStorage.removeItem('userName');
            window.location.href = 'login.html';
        });
    }
}

// Mostrar información del usuario logueado
function mostrarInfoUsuario() {
    const userName = sessionStorage.getItem('userName');
    const userRol = sessionStorage.getItem('userRol');
    
    // Buscar elemento para mostrar info del usuario
    let userInfoEl = document.getElementById('user-info');
    if (!userInfoEl) {
        // Crear elemento si no existe
        userInfoEl = document.createElement('div');
        userInfoEl.id = 'user-info';
        userInfoEl.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #667eea; color: white; padding: 8px 15px; border-radius: 5px; font-size: 0.9em;';
        document.body.appendChild(userInfoEl);
    }
    
    if (userName && userRol) {
        userInfoEl.innerHTML = `<strong>${userName}</strong> (${userRol})`;
    }
}

// Actualizar inicialización para incluir logout y info de usuario
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
    configurarLogout();
    mostrarInfoUsuario();
});
async function imprimirPDFProducto(productoId) {
    try {
        // Obtener datos del producto
        const resultado = await apiGet(`/api/inventario`);
        const items = resultado.data || [];
        const producto = items.find(item => item.id === productoId);
        
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        // Obtener historial de entradas del producto
        const entradas = await apiGet(`/api/entradas`);
        const entradasProducto = entradas.data.filter(e => e.producto_id === productoId);
        
        // Crear PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // ==================== DISEÑO DEL PDF ====================
        
        // --- ENCABEZADO ---
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Control Fácil', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(50, 50, 50);
        doc.text('Información de Producto', 105, 30, { align: 'center' });
        
        // Línea separadora
        doc.setDrawColor(102, 126, 234);
        doc.line(20, 35, 190, 35);
        
        // --- DATOS DEL PRODUCTO ---
        let yPos = 50;
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DEL PRODUCTO', 20, yPos);
        yPos += 10;
        
        doc.setFont('helvetica', 'normal');
        yPos += 5;
        doc.text(`Nombre del Producto: ${producto.nombre}`, 20, yPos);
        yPos += 8;
        doc.text(`Código de Lote: ${producto.numero_lote || 'N/A'}`, 20, yPos);
        yPos += 8;
        doc.text(`Stock Actual: ${producto.stock} ${producto.unidad}`, 20, yPos);
        yPos += 8;
        doc.text(`Fecha de Vencimiento: ${formatearFecha(producto.fecha_vencimiento) || 'No especificada'}`, 20, yPos);
        yPos += 8;
        doc.text(`Fecha de Impresión: ${new Date().toLocaleDateString()}`, 20, yPos);
        
        // --- ESTADO DEL PRODUCTO ---
        yPos += 15;
        const diasParaVencer = producto.fecha_vencimiento ? 
            Math.ceil((new Date(producto.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        
        let estado = 'En Stock';
        let estadoColor = [40, 167, 69]; // Verde
        
        if (diasParaVencer !== null) {
            if (diasParaVencer < 0) {
                estado = 'VENCIDO';
                estadoColor = [220, 53, 69]; // Rojo
            } else if (diasParaVencer <= 30) {
                estado = `Próximo a Vencer (${diasParaVencer} días)`;
                estadoColor = [255, 193, 7]; // Amarillo
            }
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...estadoColor);
        doc.text(`Estado: ${estado}`, 20, yPos);
        
        // --- HISTORIAL DE ENTRADAS ---
        if (entradasProducto.length > 0) {
            yPos += 20;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(50, 50, 50);
            doc.text('HISTORIAL DE ENTRADAS', 20, yPos);
            yPos += 10;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            // Encabezados de tabla
            doc.setFillColor(102, 126, 234);
            doc.rect(20, yPos - 5, 170, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text('Fecha', 25, yPos);
            doc.text('Cantidad', 65, yPos);
            doc.text('Proveedor', 105, yPos);
            doc.text('Lote', 155, yPos);
            yPos += 10;
            
            doc.setTextColor(50, 50, 50);
            
            // Filas de la tabla
            entradasProducto.forEach((entrada, index) => {
                if (index % 2 === 0) {
                    doc.setFillColor(248, 249, 250);
                    doc.rect(20, yPos - 4, 170, 8, 'F');
                }
                doc.text(formatearFecha(entrada.fecha), 25, yPos);
                doc.text(`${entrada.cantidad} ${entrada.unidad}`, 65, yPos);
                doc.text(entrada.proveedor || '-', 105, yPos);
                doc.text(entrada.lote || '-', 155, yPos);
                yPos += 8;
                
                // Nueva página si es necesario
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
            });
        }
        
        // --- PIE DE PÁGINA ---
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Sistema de Gestión de Inventario - Control Fácil', 105, 290, { align: 'center' });
        
        // Guardar PDF
        const nombreArchivo = `producto_${producto.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        mostrarNotificacion('✓ PDF generado correctamente', 'success');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        mostrarNotificacion('Error al generar el PDF', 'error');
    }
}