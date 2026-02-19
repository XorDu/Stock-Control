// ============================================
// API SERVICE - Comunicación con el servidor
// ============================================

const API_URL = ''; // Mismo dominio

/**
 * Realiza una petición GET al servidor
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function apiGet(endpoint) {
    const headers = {};
    const rol = sessionStorage.getItem('userRol');
    if (rol) headers['user-rol'] = rol;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: headers
    });
    return await response.json();
}

/**
 * Realiza una petición POST al servidor
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function apiPost(endpoint, data) {
    const headers = { 'Content-Type': 'application/json' };
    const rol = sessionStorage.getItem('userRol');
    if (rol) headers['user-rol'] = rol;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
    return await response.json();
}

/**
 * Realiza una petición DELETE al servidor
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function apiDelete(endpoint) {
    const headers = {};
    const rol = sessionStorage.getItem('userRol');
    if (rol) headers['user-rol'] = rol;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: headers
    });
    return await response.json();
}
