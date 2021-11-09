const socket = io.connect();

// ESCUCHA LA LISTA DE MENSAJES
socket.on("message_rta", (data) => {
    console.log(data);
    render(data)
    socket.emit("mensaje_cliente", "Mensajes actualizados")
})

// FUNCION PARA RENDERIZAR LOS MENSAJES
const render = (data) => {
    let html = data.map(x => {
        return `<p><strong>${x.email}:</strong> ${x.text}</p>`
    }).join(" ");
    document.querySelector("#contenedor").innerHTML = html;
}

// FUNCION PARA CAPTURAR LOS MENSAJES NUEVOS Y ENVIARLOS AL SERVER
const addMessage = () => {
    let dataObj = {
        email: document.querySelector("#email").value,
        text: document.querySelector("#text").value
    }
    console.log(dataObj);
    socket.emit("dataText", dataObj)
    document.querySelector("#email").value = "";
    document.querySelector("#text").value = "";

    return false;
}

// ESCUCHA LA LISTA DE PRODUCTOS
socket.on("arrUpdated", (dataObj) => {
    console.log(dataObj);
    updateTable(dataObj);
    socket.emit("updateConfirm", "Productos actualizados")
})

// FUNCION PARA RENDERIZAR LOS PRODUCTOS
const updateTable = (data) => {
    let html = data.map(x => {
        return `<tr>
                    <td>${x.nombre}</td>
                    <td>${x.precio}</td>
                    <td>
                        <img src=${x.thumb} alt="foto del prod" className="ml-0" height="60px"/>
                    </td>
                </tr>`
    }).join(" ")
    document.querySelector("#tableProds").innerHTML = html;
}

// FUNCION PARA CAPTURAR LOS PRODUCTOS NUEVOS Y MANDARLOS AL SERVER
const addProd = () => {
    let dataObj = {
        nombre: document.querySelector("#nombre").value,
        precio: document.querySelector("#precio").value,
        thumb: document.querySelector("#thumb").value
    }
    console.log(dataObj);
    socket.emit("newProd", dataObj)
    document.querySelector("#nombre").value = "";
    document.querySelector("#precio").value = "";
    document.querySelector("#thumb").value = "";

    return false;
}