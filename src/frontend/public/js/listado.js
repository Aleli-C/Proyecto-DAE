// src/frontend/public/js/listado.js

// ── Estado global ────────────────────────────────────────
let allOrganisms = [];      // datos originales de la API
let filtered    = [];       // datos tras aplicar búsqueda y filtro
let sortCol     = 'common_name';
let sortDir     = 'asc';    // 'asc' | 'desc'

// ── Inicialización ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrganisms();

    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('clade-filter').addEventListener('change', applyFilters);

    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.col;
            if (sortCol === col) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortCol = col;
                sortDir = 'asc';
            }
            updateSortIcons();
            render();
        });
    });
});

// ── Carga de datos ───────────────────────────────────────
async function loadOrganisms() {
    showState('loading');
    try {
        const res = await fetch('/api/organisms');
        if (!res.ok) throw new Error('Sesión no válida');

        allOrganisms = await res.json();

        // Poblar selector de clados (únicos, ordenados)
        const clades = [...new Set(allOrganisms.map(o => o.clade))].sort();
        const select = document.getElementById('clade-filter');
        clades.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            select.appendChild(opt);
        });

        // Mostrar contador total
        document.getElementById('total-count').textContent = allOrganisms.length;
        document.getElementById('counter-badge').classList.remove('hidden');

        applyFilters();
    } catch (err) {
        document.getElementById('error-msg').textContent =
            err.message === 'Sesión no válida'
                ? 'Tu sesión expiró. Serás redirigido al login...'
                : 'No se pudo conectar con el servidor.';
        showState('error');
        if (err.message === 'Sesión no válida') {
            setTimeout(() => window.location.href = '/login', 2000);
        }
    }
}

// ── Filtrado ─────────────────────────────────────────────
function applyFilters() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    const clade = document.getElementById('clade-filter').value;

    filtered = allOrganisms.filter(o => {
        const matchesSearch =
            !query ||
            o.common_name.toLowerCase().includes(query) ||
            o.scientific_name.toLowerCase().includes(query) ||
            o.clade.toLowerCase().includes(query);

        const matchesClade = !clade || o.clade === clade;

        return matchesSearch && matchesClade;
    });

    render();
}

// ── Ordenamiento ─────────────────────────────────────────
function sortFiltered() {
    filtered.sort((a, b) => {
        const va = (a[sortCol] || '').toLowerCase();
        const vb = (b[sortCol] || '').toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 :  1;
        if (va > vb) return sortDir === 'asc' ?  1 : -1;
        return 0;
    });
}

function updateSortIcons() {
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.col === sortCol) {
            th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

// ── Renderizado ──────────────────────────────────────────
function render() {
    sortFiltered();

    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        showState('empty');
        return;
    }

    showState('table');

    filtered.forEach((org, idx) => {
        const tr = document.createElement('tr');

        // Clase normalizada del clado para el badge CSS
        const cladeClass = 'clade-' + org.clade.replace(/\s+/g, '');

        tr.innerHTML = `
            <td class="td-num">${idx + 1}</td>
            <td><strong>${escapeHTML(org.common_name)}</strong></td>
            <td class="td-sci">${escapeHTML(org.scientific_name)}</td>
            <td><span class="clade-badge ${cladeClass}">${escapeHTML(org.clade)}</span></td>
            <td style="text-align:center">
                <button
                    class="btn-compare"
                    onclick="goToCompare(${org.organism_id})"
                    title="Comparar ${escapeHTML(org.common_name)} con otro organismo"
                >
                    Comparar →
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Resumen inferior
    const total = allOrganisms.length;
    const shown = filtered.length;
    document.getElementById('results-summary').textContent =
        shown === total
            ? `Mostrando los ${total} organismos registrados.`
            : `Mostrando ${shown} de ${total} organismos.`;
}

// ── Navegación a comparar ────────────────────────────────
function goToCompare(organismId) {
    // Guarda el ID en sessionStorage para que comparar.js lo preseleccione
    sessionStorage.setItem('preselect_organism', organismId);
    window.location.href = '/comparar';
}

// ── Helpers ──────────────────────────────────────────────
function showState(state) {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('table-wrapper').classList.add('hidden');

    if (state === 'loading') document.getElementById('loading-state').classList.remove('hidden');
    if (state === 'error')   document.getElementById('error-state').classList.remove('hidden');
    if (state === 'empty')   document.getElementById('empty-state').classList.remove('hidden');
    if (state === 'table')   document.getElementById('table-wrapper').classList.remove('hidden');
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}