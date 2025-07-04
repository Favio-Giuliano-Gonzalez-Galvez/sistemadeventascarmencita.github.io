let productos = [];
let numeroFicha = parseInt(localStorage.getItem("numeroFicha")) || 0;

function agreg_productos() {
    let boton_adicionar_productos = document.getElementById("agregar_producto");

    boton_adicionar_productos.addEventListener("click", function () {
        let nombre_agregar_producto = document.getElementById("nombre_agregar_producto").value;
        let precio_agregar_producto = parseFloat(document.getElementById("precio_agregar_producto").value);

        if (nombre_agregar_producto && !isNaN(precio_agregar_producto)) {
            creacion_producto(nombre_agregar_producto, precio_agregar_producto);
        } else {
            alert("Por favor, introduce un nombre y un precio válidos.");
        }
    });
}







function eliminar_producto(nombre_producto) {
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar el producto "${nombre_producto}"?`);

    if (!confirmacion) {
        return; // Si el usuario presiona "Cancelar", no hace nada
    }

    // Eliminar del array
    const index = productos.findIndex(p => p.nombre === nombre_producto);
    if (index !== -1) {
        productos.splice(index, 1);
    }

    // Actualizar el localStorage
    guardar_en_localStorage();

    // Eliminar visualmente del HTML
    const lista = document.getElementById("lista_productos");
    const hijos = Array.from(lista.children);
    for (const hijo of hijos) {
        if (hijo.textContent.includes(nombre_producto)) {
            lista.removeChild(hijo);
            break;
        }
    }

    // Actualizar total
    actualizar_total();
}



function creacion_producto(nombre, precio) {
    const contenedor_producto = document.createElement("div");
    contenedor_producto.style.marginBottom = "10px";

    // Span del nombre (con función de eliminar al hacer clic)
    const producto_agregado_nombre = document.createElement("span");
    producto_agregado_nombre.textContent = `${nombre} `;
    producto_agregado_nombre.style.marginRight = "10px";
    producto_agregado_nombre.style.cursor = "pointer";
    producto_agregado_nombre.title = "Haz clic para eliminar este producto";

    // Al hacer clic en el nombre, eliminar el producto
    producto_agregado_nombre.addEventListener("click", function () {
        eliminar_producto(nombre);
    });

    const producto_agregado_precio = document.createElement("span");
    producto_agregado_precio.textContent = `Bs. ${precio} `;
    producto_agregado_precio.style.marginRight = "10px";

    const producto_agregado_input = document.createElement("input");
    producto_agregado_input.type = "number";
    producto_agregado_input.style.marginRight = "0px";
    producto_agregado_input.value = 0;

    const producto = { nombre, precio, cantidad: 0 };
    productos.push(producto);

    guardar_en_localStorage();

    producto_agregado_input.addEventListener("input", function () {
        producto.cantidad = parseInt(producto_agregado_input.value) || 0;
        actualizar_total();
        guardar_en_localStorage();
    });

    let division = document.createElement("hr");

    contenedor_producto.append(
        producto_agregado_nombre,
        producto_agregado_precio,
        producto_agregado_input,
        division
    );

    document.getElementById("lista_productos").appendChild(contenedor_producto);
}


//guarda producto el localstorage
// Guarda el array de productos en localStorage
function guardar_en_localStorage() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

// Carga los productos desde localStorage
function cargar_desde_localStorage() {
    const datos = localStorage.getItem("productos");
    if (datos) {
        const productos_guardados = JSON.parse(datos);
        productos_guardados.forEach(p => creacion_producto(p.nombre, p.precio));
    }
}

window.addEventListener("DOMContentLoaded", function () {
    cargar_desde_localStorage();
});
//fin carga productos el localstorage









function actualizar_total() {
    const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    document.getElementById("total_valor").textContent = total.toFixed(2);
    calcular_cambio(); // Actualizar el cambio cuando cambia el total
}

function calcular_cambio() {
    const total = parseFloat(document.getElementById("total_valor").textContent) || 0;
    const efectivo = parseFloat(document.getElementById("input_efectivo_cliente").value) || 0;
    const cambio = efectivo - total;
    document.getElementById("total_cambio").innerHTML = `Cambio: <span>${cambio.toFixed(2)}</span>`;
}

document.getElementById("input_efectivo_cliente").addEventListener("input", calcular_cambio);

function preparar_reporte() {
    const nombre_persona = document.getElementById("input_nombre_persona").value;
    document.getElementById("nombre_persona_reporte").textContent = nombre_persona;

    numeroFicha++;
    document.getElementById("numero_ficha").textContent = `# ${numeroFicha}`;
    localStorage.setItem("numeroFicha", numeroFicha);

    const reporte_tabla = document.getElementById("reporte_tabla");
    reporte_tabla.innerHTML = "";

    let total_general = 0;
    let tablaHTML = "";

    productos.forEach((producto) => {
        if (producto.cantidad > 0) {
            const subtotal = producto.precio * producto.cantidad;
            total_general += subtotal;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>Bs. ${producto.precio}</td>
                <td>Bs. ${subtotal.toFixed(2)}</td>
            `;
            reporte_tabla.appendChild(fila);

            tablaHTML += `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>${producto.cantidad}</td>
                </tr>
            `;
        }
    });

    document.getElementById("reporte_total").textContent = total_general.toFixed(2);
    document.getElementById("reporte").style.display = "block";

    // Obtener el efectivo ingresado y calcular el cambio
    const efectivo = parseFloat(document.getElementById("input_efectivo_cliente").value) || 0;
    const cambio = efectivo - total_general;

    guardar_pedido(nombre_persona, total_general, efectivo, cambio, tablaHTML);
}




function guardar_pedido(nombre, total, efectivo, cambio, tablaHTML) {
    const pedidos_hechos = document.getElementById("pedidos_hechos");

    const fecha = new Date().toLocaleString();
    const ficha = numeroFicha;

    // Guardar en localStorage
    let historial = JSON.parse(localStorage.getItem("historialPedidos")) || [];
    historial.push({
        fecha,
        ficha,
        nombre,
        total,
        efectivo,
        cambio,
        tablaHTML,
        checkbox: false // Agregamos el estado del checkbox
    });
    localStorage.setItem("historialPedidos", JSON.stringify(historial));

    // Renderizar visualmente el pedido (nuevo)
    renderPedido(historial.length - 1, historial[historial.length - 1]);
}


function renderPedido(index, pedido) {
    const pedidos_hechos = document.getElementById("pedidos_hechos");

    const contenedor_pedido = document.createElement("div");
    contenedor_pedido.className = "reporte";
    contenedor_pedido.style.position = "relative";

    // Checkbox arriba a la derecha
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = pedido.checkbox;
    checkbox.style.position = "absolute";
    checkbox.style.top = "50px";
    checkbox.style.right = "10px";
    checkbox.style.transform = 'scale(2)'

    checkbox.addEventListener("change", () => {
        let historial = JSON.parse(localStorage.getItem("historialPedidos")) || [];
        historial[index].checkbox = checkbox.checked;
        localStorage.setItem("historialPedidos", JSON.stringify(historial));
    });

    contenedor_pedido.innerHTML = `
        <h4>Pedido generado el: ${pedido.fecha}</h4>
        <b>Ficha N°:</b> ${pedido.ficha}<br>
        <b>Nombre: </b>${pedido.nombre}<br>
        <b>Total General: Bs. ${pedido.total.toFixed(2)}</b><br>
        <b>Efectivo: Bs. ${pedido.efectivo.toFixed(2)}</b><br>
        <b>Cambio: Bs. ${pedido.cambio.toFixed(2)}</b><br>
        <table style="width: 100%; margin-top: 10px;">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>${pedido.tablaHTML}</tbody>
        </table>
        <hr>
    `;

    contenedor_pedido.appendChild(checkbox);
    pedidos_hechos.insertBefore(contenedor_pedido, pedidos_hechos.firstChild);
}

window.onload = function () {
    const historial = JSON.parse(localStorage.getItem("historialPedidos")) || [];
    historial.forEach((pedido, index) => {
        renderPedido(index, pedido);
    });
};





function imprimir_reporte() {
    preparar_reporte();
     
    window.print();

}

function nombres_gente() {
    document.getElementById("nombre_persona").textContent = document.getElementById("input_nombre_persona").value;
}

document.getElementById("imprimir_reporte").addEventListener("click", imprimir_reporte);

agreg_productos();
