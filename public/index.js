// const socket = io();

// socket.on("mensaje_rta", (data) => {
//     // aca voy a tener la data disponible que le envie por el socket.emit del otro index.js
//     console.log(data);
//     render(data)
//     socket.emit("mensaje_cliente", "Hola, soy el cliente")
// })

// const render = (data) => {
//     let html = data.map(x => {
//         return `<p><strong>${x.nombre}:</strong> ${x.msn}</p>`
//     }).join(" ");
//     document.querySelector("#contenedor").innerHTML = html;
// }

// const addInfo = () => {
//     let dataObj = {
//         nombre: document.querySelector("#nm").value,
//         msn: document.querySelector("#msn").value
//     }
//     console.log(dataObj);
//     socket.emit("dataMsn", dataObj)
//     document.querySelector("#msn").value = "";


//     return false;
// }