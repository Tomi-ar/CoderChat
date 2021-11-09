const express = require("express");
const app = express();
const router = require("./routes/productos");
const handlebars = require('express-handlebars');
const fs = require("fs");

// Server
const http = require("http")
const server = http.createServer(app)
const port = process.env.PORT || 3003;

// Para trabajar con form
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use("/productos", router)

// Motores de plantillas >> Hbs
app.set("views", "./views")
app.set("view engine", "hbs")
app.engine(
    "hbs",
    handlebars({
        extname: "hbs",
        layoutsDir: __dirname+"/views/layouts",
        defaultLayout: "index",
        partialsDir: __dirname+"/views/partials",
    })
)

// Socket
const { Server } = require("socket.io")
const io = new Server(server)
app.use(express.static(__dirname+"/public"))

//Conexion Socket
io.on("connection", (socket) => {
    console.log("Cliente conectado");
    fs.readFile("./db/Comms.txt", "utf-8", (err,data) => {
        let info = JSON.parse(data);
        socket.emit("message_rta", info)
    })
    fs.readFile("./db/arrProds.txt", "utf-8", (err,data) => {
        let info = JSON.parse(data);
        socket.emit("arrUpdated", info)
    })
   
    socket.on("dataText", (dataObj) => {
        fs.readFile("./db/Comms.txt", "utf-8", (err,data) => {
            let dataFile = JSON.parse(data);
            let newCom = {
                email: dataObj.email,
                text: dataObj.text
            }
            dataFile.push(newCom);
            console.log(dataFile);
            fs.writeFile("./db/Comms.txt", JSON.stringify(dataFile), (err) => {
                console.log("Comentario guardado");
                io.sockets.emit("message_rta", dataFile)
            })
        })
    })
      
    socket.on("mensaje_cliente", (data) =>{
        console.log(data);
    })

    socket.on("newProd", (dataObj) => {
        fs.readFile("./db/arrProds.txt", "utf-8", (err,data) => {
            let dataFile = JSON.parse(data)
            let items = dataFile.length;
            let id = parseInt(dataFile[items - 1].id) + 1;
            let newProd = {
                    nombre: dataObj.nombre,
                    precio: dataObj.precio,
                    thumb: dataObj.thumb,
                    id: id
                }
            
            dataFile.push(newProd)
            console.log(dataFile);
            fs.writeFile("./db/arrProds.txt", JSON.stringify(dataFile, null, 2), (err,data) =>{
                console.log("Producto guardado!");
                io.sockets.emit("arrUpdated", dataFile)
            })
        })
    })
    socket.on("updateConfirm", () => {
        console.log("Actualizado");
    })
})
// Rutas
app.get("/", (req, res) => {
    res.render("main")
})

server.listen(port, () => {
    console.log("Server running on "+port);
})