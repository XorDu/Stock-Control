// ============================================
// CONTROL FÁCIL - Sistema de Gestión de Inventario
// Frontend conectado a MySQL
// ============================================

const API_URL = ''; // Mismo dominio

// ============================================
// API HELPERS
// ============================================

async function apiGet(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);
    return await response.json();
}

async function apiPost(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function apiDelete(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE'
    });
    return await response.json();
}

async function inicializarApp() {
    // Configurar fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('entrada-fecha').value = hoy;

    // Configurar navegación de tabs
    configurarTabs();

    // Configurar formularios
    configurarFormularioEntrada();
    configurarFormularioSalida();

    // Configurar búsqueda
    configurarBusqueda();

    // Cargar datos del servidor
    await cargarDatosIniciales();
}

// ============================================
// API HELPERS
// ============================================

async function apiGet(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);
    return await response.json();
}

async function apiPost(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function cargarDatosIniciales() {
    try {
        await Promise.all([
            renderizarEntradas(),
            renderizarSalidas(),
            renderizarInventario(),
            renderizarVencimientos(),
            actualizarResumen()
        ]);
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

    tabButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const tabName = this.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');

            if (tabName === 'inventario') {
                await renderizarInventario();
                await actualizarResumen();
            } else if (tabName === 'vencimientos') {
                await renderizarVencimientos();
            }
        });
    });
}

// ============================================
// FORMULARIO DE ENTRADAS
// ============================================

function configurarFormularioEntrada() {
    const form = document.getElementById('form-entrada');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const producto = document.getElementById('entrada-producto').value.trim();
        const cantidad = parseInt(document.getElementById('entrada-cantidad').value);
        const unidad = document.getElementById('entrada-unidad').value;
        const lote = document.getElementById('entrada-lote').value.trim();
        const proveedor = document.getElementById('entrada-proveedor').value.trim();
        const fecha = document.getElementById('entrada-fecha').value;
        const vencimiento = document.getElementById('entrada-vencimiento').value;

        if (cantidad <= 0) {
            mostrarNotificacion('La cantidad debe ser mayor a 0', 'error');
            return;
        }

        const resultado = await apiPost('/api/entradas', {
            producto,
            cantidad,
            unidad,
            lote,
            proveedor,
            fecha,
            vencimiento: vencimiento || null
        });

        if (resultado.success) {
            mostrarNotificacion(`✓ Entrada registrada: ${cantidad} ${unidad} de ${producto}`, 'success');
            form.reset();
            document.getElementById('entrada-fecha').value = new Date().toISOString().split('T')[0];
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
    const resultado = await apiGet('/api/entradas');
    
    if (!resultado.success || resultado.data.length === 0) {
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
            <button class="btn-delete" onclick="eliminarEntrada(${entrada.id})">🗑️ Eliminar</button>
        </div>
    `).join('');
}

async function eliminarEntrada(id) {
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
            selectLote.disabled = false;
            selectLote.innerHTML = `
                <option value="${producto.id}">
                    Stock: ${producto.stock} ${producto.unidad}
                </option>
            `;
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
        const cantidad = parseInt(inputCantidad.value);
        const motivo = document.getElementById('salida-motivo').value;

        if (!productoId) {
            mostrarNotificacion('Debe seleccionar un producto', 'error');
            return;
        }

        if (cantidad <= 0) {
            mostrarNotificacion('La cantidad debe ser mayor a 0', 'error');
            return;
        }

        const resultado = await apiPost('/api/salidas', {
            producto_id: productoId,
            cantidad,
            motivo
        });

        if (resultado.success) {
            const productos = await apiGet('/api/productos');
            const producto = productos.data.find(p => p.id == productoId);
            mostrarNotificacion(`✓ Salida registrada: ${cantidad} ${producto?.unidad || ''} de ${producto?.nombre}`, 'success');
            form.reset();
            selectLote.disabled = true;
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
    const resultado = await apiGet('/api/salidas');
    
    if (!resultado.success || resultado.data.length === 0) {
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
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay productos en el inventario</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => {
        const stockClass = item.stock < 10 ? 'stock-low' : 'stock-ok';
        const vencimientoTexto = item.fecha_vencimiento ? formatearFecha(item.fecha_vencimiento) : 'N/A';
        
        return `
            <tr>
                <td><strong>${item.nombre}</strong></td>
                <td>L-${item.id}</td>
                <td class="${stockClass}">${item.stock} ${item.unidad}</td>
                <td>-</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>${vencimientoTexto}</td>
                <td><button class="btn-delete-small" onclick="eliminarProducto(${item.id})">🗑️</button></td>
            </tr>
        `;
    }).join('');
}

async function eliminarProducto(id) {
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
        document.getElementById('total-lotes').textContent = resultado.data.total;
        document.getElementById('productos-bajos').textContent = resultado.data.bajos;
    }
}

function configurarBusqueda() {
    const inputBusqueda = document.getElementById('buscar-inventario');
    inputBusqueda.addEventListener('input', function() {
        renderizarInventario(this.value);
    });
}

// ============================================
// VENCIMIENTOS
// ============================================

async function renderizarVencimientos() {
    const resultado = await apiGet('/api/vencimientos');
    
    if (!resultado.success) {
        document.getElementById('lista-vencidos').innerHTML = '<div class="empty-message">Error cargando datos</div>';
        document.getElementById('lista-proximos').innerHTML = '<div class="empty-message">Error cargando datos</div>';
        document.getElementById('lista-buenos').innerHTML = '<div class="empty-message">Error cargando datos</div>';
        return;
    }

    const { vencidos, proximos, buenos } = resultado.data;

    const renderizarLista = (items, elementoId) => {
        const el = document.getElementById(elementoId);
        if (items.length === 0) {
            el.innerHTML = '<div class="empty-message">No hay productos</div>';
            return;
        }
        el.innerHTML = items.map(item => `
            <div class="vencimiento-item">
                <strong>${item.nombre}</strong>
                <small>Stock: ${item.stock} - Vence: ${formatearFecha(item.fecha_vencimiento)}</small>
            </div>
        `).join('');
    };

    renderizarLista(vencidos, 'lista-vencidos');
    renderizarLista(proximos, 'lista-proximos');
    renderizarLista(buenos, 'lista-buenos');
}

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
// LOGOUT
// ============================================

function configurarLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('authenticated');
            window.location.href = 'login.html';
        });
    }
}

// Actualizar inicialización para incluir logout
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
    configurarLogout();
});
