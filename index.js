const express = require("express");
const app = express();
const router = require("./routes/productos");
const faker = require("faker");
const handlebars = require('express-handlebars');
const fs = require("fs");
var moment = require("moment")

// Requiero para el normalizado
const { normalize, schema } = require('normalizr');
const dataMsg = require('./db/arrProds.txt');

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

// Crear la lista de productos con FAKER
const createFaker = async () => {
    let fakerArr = [];
    
    for (let i = 1; i < 6; i++) {
    fakerArr.push({
        id: i,
        nombre: faker.commerce.productName(),
        precio: faker.commerce.price(),
        thumb: faker.image.image()
    });
};

    await fs.writeFile("./db/arrProds.txt", JSON.stringify(fakerArr, null, 2), (err,data) =>{
        console.log("Producto guardado!");
    })
}
createFaker();

// Normalizacion de mensajes
const authorSchema = new schema.Entity("autor", {}, { idAttribute: "id" });
const msjSchema = new schema.Entity("mensaje", {author: authorSchema}, { idAttribute: "dateTime" });
const postSchema= new schema.Entity('post', { mensajes: [msjSchema] }, { idAttribute: 'id' })


//Conexion) Socket
io.on("connection", (socket) => {
    console.log("Cliente conectado");
    fs.readFile("./db/Comms.txt", "utf-8", (err,data) => {
        let info = JSON.parse(data);
        const normalized = normalize(info, postSchema);
        // console.log(JSON.stringify(normalized).length);
        // console.log(data.length)
        socket.emit("message_rta_normlz", normalized)
    })
    fs.readFile("./db/arrProds.txt", "utf-8", (err,data) => {        
        let info = JSON.parse(data);
        socket.emit("arrUpdated", info)
    })
   
    socket.on("dataText", (dataObj) => {
        fs.readFile("./db/Comms.txt", "utf-8", (err,data) => {
            let dataFile = JSON.parse(data);
            let listaMensajes = dataFile.mensajes;
            let newDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
            let newCom = {
                author: {
                    id: dataObj.id,
                    nombre: dataObj.name,
                    apellido: dataObj.lastname,
                    edad: dataObj.age,
                    alias: dataObj.alias,
                    avatar: dataObj.avatar
                },
                text: dataObj.text,
                dateTime: newDateTime
            }

            listaMensajes.push(newCom);
            console.log(listaMensajes);
            fs.writeFile("./db/Comms.txt", JSON.stringify(dataFile, null, 2), (err) => {
                console.log("Comentario guardado");

                const normalized = normalize(dataFile, postSchema);
                io.sockets.emit("message_rta_normlz", normalized)
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