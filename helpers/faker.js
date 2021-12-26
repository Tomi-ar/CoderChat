const faker = require("faker");
const fs = require("fs");

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

module.exports = createFaker;