const socket = io();

socket.on("message_rta", (data) => {
    console.log(data);
    render(data)
    socket.emit("mensaje_cliente", "Hola, soy el cliente")
})

const render = (data) => {
    let html = data.map(x => {
        return `<p><strong>${x.email}:</strong> ${x.text}</p>`
    }).join(" ");
    document.querySelector("#contenedor").innerHTML = html;
}

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

socket.on("arrUpdated", (dataObj) => {
    console.log(dataObj);
    updateTable(dataObj);
    socket.emit("updateConfirm", "Tabla actualizada")
})


const updateTable = (data) => {
    let html = data.map(x => {
        return `<tr>
                    <td>${x.nombre}</td>
                    <td>${x.precio}</td>
                    <td>${x.thumb}</td>
                </tr>`
    })
    document.querySelector("#tableProds").innerHTML = html;
}
