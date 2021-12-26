const express = require('express');
const { Router } = require('express');
const fs = require("fs");
const webAuth = require('../auth/authMiddlew');

const router = new Router();

router.get("/", (req, res) => {
    res.render("productos", {login: req.session.login})
})

// router.post("/", (req, res) => {
//     console.log(req.body);
//     fs.readFile("./db/arrProds.txt", "utf-8", (err,data) => {
//         let dataFile = JSON.parse(data)
//         let items = dataFile.length;
//         let id = parseInt(dataFile[items - 1].id) + 1;
//         let newProd = {
//                 nombre: req.body.nombre,
//                 precio: req.body.precio,
//                 thumb: req.body.thumb,
//                 id: id
//             }
        
//         dataFile.push(newProd)
//         fs.writeFile("./db/arrProds.txt", JSON.stringify(dataFile, null, 2), (err,data) =>{
//             console.log("Producto guardado!");
//             res.render("productos", {data: dataFile});            
//         })
//     })
// })

module.exports = router;