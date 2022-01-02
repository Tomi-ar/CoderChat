const express = require("express");
const app = express();
const router = require("./routes/productos/productos");
const authLogin = require("./routes/auth/login");
const handlebars = require('express-handlebars');
const createFaker = require("./helpers/faker");
const fs = require("fs");
var moment = require("moment")

// Requiero para el normalizado
const { normalize, schema } = require('normalizr');
const dataMsg = require('./db/arrProds.txt');

// Normalizacion de mensajes
const authorSchema = new schema.Entity("autor", {}, { idAttribute: "id" });
const msjSchema = new schema.Entity("mensaje", {author: authorSchema}, { idAttribute: "dateTime" });
const postSchema= new schema.Entity('post', { mensajes: [msjSchema] }, { idAttribute: 'id' })


// Server
const http = require("http")
const server = http.createServer(app)
const port = process.env.PORT || 3003;

// Socket
const { Server } = require("socket.io");
const io = new Server(server)
app.use(express.static(__dirname+"/public"))


// Para trabajar con form
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use("/productos", router)
// app.use("/", authLogin)

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


// CONFIGURACION DEL SESSION
const session = require("express-session")
const cookieParser = require("cookie-parser")
const MongoStore = require("connect-mongo")
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
app.use(cookieParser())
app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://Tomas:t4VMECAcMAvPYNN@ecommerceatlas.80zrg.mongodb.net/ecommerceAtlas?retryWrites=true&w=majority",
        mongoOptions: advancedOptions,
        collectionName: "sessions"
    }),
    secret: "sunrise",
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 100000
    }
}))


//Conexion) Socket
io.on("connection", (socket) => {
    console.log("Cliente conectado");
    fs.readFile("./db/Comms.txt", "utf-8", (err,data) => {
        let info = JSON.parse(data);
        const normalized = normalize(info, postSchema);
        socket.emit("message_rta_normlz", normalized)
    })
    createFaker();
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

app.get("/login", (req, res) => {
    const user = req.session?.login
    if (user) {
        res.redirect('/productos', {login: user})
    } else {
        res.render('login')
    }
})

app.post("/login", (req, res) => {
    req.session.login = req.body.login;
    console.log(req.body.login);
    res.redirect("/productos")
    // res.send(req.body.login)
})

app.get("/logout", (req, res) => {
    const nombre = req.session?.nombre
    if (nombre) {
        req.session.destroy(err => {
            if (!err) {
                res.render('logout', { nombre })
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/')
    }
})

server.listen(port, () => {
    console.log("Server running on "+port);
})