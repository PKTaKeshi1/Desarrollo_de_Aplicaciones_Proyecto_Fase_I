class ColecTrack {
    constructor() {
        this.coleccion = JSON.parse(localStorage.getItem('coleccion')) || [];
        this.init();
    }

    init() {
        this.cargarEventListeners();
        this.actualizarVista();
    }

    cargarEventListeners() {
        const formulario = document.getElementById('item-form');
        const buscador = document.getElementById('buscador');
        const filtroCategoria = document.getElementById('filtro-categoria');

        if (formulario) {
            formulario.addEventListener('submit', (e) => this.agregarItem(e));
        }
        if (buscador) {
            buscador.addEventListener('input', () => this.filtrarItems());
        }
        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', () => this.filtrarItems());
        }
    }

    agregarItem(event) {
        event.preventDefault();
        
        if (!this.validarFormulario()) {
            this.mostrarAlerta('Por favor completa todos los campos requeridos', 'danger');
            return;
        }

        const nuevoItem = {
            id: Date.now(),
            nombre: document.getElementById('nombre').value,
            categoria: document.getElementById('categoria').value,
            valor: parseFloat(document.getElementById('valor').value),
            fecha: document.getElementById('fecha').value,
            estado: document.querySelector('input[name="estado"]:checked').value,
            descripcion: document.getElementById('descripcion').value
        };

        this.coleccion.push(nuevoItem);
        this.guardarEnLocalStorage();
        this.actualizarVista();
        document.getElementById('item-form').reset();
        
        this.mostrarAlerta('Item agregado correctamente a la colección', 'success');
    }

    validarFormulario() {
        const nombre = document.getElementById('nombre').value;
        const categoria = document.getElementById('categoria').value;
        const valor = document.getElementById('valor').value;
        const fecha = document.getElementById('fecha').value;
        const estado = document.querySelector('input[name="estado"]:checked');

        if (!nombre || !categoria || !valor || !fecha || !estado) {
            return false;
        }

        if (isNaN(parseFloat(valor)) || parseFloat(valor) < 0) {
            return false;
        }

        return true;
    }

    eliminarItem(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este item?')) {
            this.coleccion = this.coleccion.filter(item => item.id !== id);
            this.guardarEnLocalStorage();
            this.actualizarVista();
            this.mostrarAlerta('Item eliminado correctamente', 'warning');
        }
    }

    filtrarItems() {
        const textoBusqueda = document.getElementById('buscador').value.toLowerCase();
        const categoriaFiltro = document.getElementById('filtro-categoria').value;

        let itemsFiltrados = this.coleccion.filter(item => {
            const coincideTexto = item.nombre.toLowerCase().includes(textoBusqueda) || 
                                item.descripcion.toLowerCase().includes(textoBusqueda);
            const coincideCategoria = !categoriaFiltro || item.categoria === categoriaFiltro;
            
            return coincideTexto && coincideCategoria;
        });

        this.mostrarItemsEnTabla(itemsFiltrados);
    }

    mostrarItemsEnTabla(items = this.coleccion) {
        const tbody = document.getElementById('tabla-body');
        const filaVacia = document.getElementById('fila-vacia');

        if (items.length === 0) {
            tbody.innerHTML = '<tr id="fila-vacia"><td colspan="7" class="text-center text-muted py-4">No se encontraron items</td></tr>';
            return;
        }

        if (filaVacia) filaVacia.style.display = 'none';

        tbody.innerHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <strong>${this.escapeHtml(item.nombre)}</strong>
                    ${item.descripcion ? `<br><small class="text-muted">${this.escapeHtml(item.descripcion)}</small>` : ''}
                </td>
                <td>
                    <span class="badge bg-secondary">${item.categoria}</span>
                </td>
                <td><strong>S/.${item.valor.toFixed(2)}</strong></td>
                <td>${new Date(item.fecha).toLocaleDateString('es-ES')}</td>
                <td>
                    <span class="badge ${item.estado === 'nuevo' ? 'bg-success' : 'bg-warning'}">
                        ${item.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.eliminarItem(${item.id})" title="Eliminar">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    actualizarVista() {
        this.mostrarItemsEnTabla();
        this.actualizarEstadisticas();
        this.actualizarResumenTabla();
    }

    actualizarEstadisticas() {
        const totalItems = this.coleccion.length;
        const valorTotal = this.coleccion.reduce((sum, item) => sum + item.valor, 0);
        const categoriasUnicas = new Set(this.coleccion.map(item => item.categoria)).size;
        const valorPromedio = totalItems > 0 ? valorTotal / totalItems : 0;

        document.getElementById('stats-total').textContent = totalItems;
        document.getElementById('stats-valor').textContent = `S/.${valorTotal.toFixed(2)}`;
        document.getElementById('stats-categorias').textContent = categoriasUnicas;
        document.getElementById('stats-promedio').textContent = `S/.${valorPromedio.toFixed(2)}`;
    }

    actualizarResumenTabla() {
        const valorTotal = this.coleccion.reduce((sum, item) => sum + item.valor, 0);
        document.getElementById('total-valor').textContent = `S/.${valorTotal.toFixed(2)}`;
        document.getElementById('total-items').textContent = `${this.coleccion.length} items en colección`;
    }

    mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
        alerta.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const formulario = document.getElementById('formulario');
        formulario.insertBefore(alerta, formulario.firstChild);

        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.remove();
            }
        }, 5000);
    }

    guardarEnLocalStorage() {
        localStorage.setItem('coleccion', JSON.stringify(this.coleccion));
    }

    escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
}

const app = new ColecTrack();