const express = require('express');
const router = express.Router();
const fs = require('fs');

function generateProductId(products) {
    if (products.length === 0) {
        return 1;
    }

    const maxId = products.reduce((max, products) => (products.id > max ? products.id : max), 0);

    for (let i = 1; i <= maxId; i++) {
        const idExists = products.some(product => product.id === i);
        if (!idExists) {
            return i;
        }
    }

    return maxId + 1;
}

// Listar todos los productos
router.get('/', (req, res) => {
    try {
        const data = fs.readFileSync('./data/products.json', 'utf-8');

        const products = JSON.parse(data);

        res.json(products);
    } catch (error) {
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
});

router.get('/:pid', (req, res) => {
    try {
        const productId = req.params.pid;

        const data = fs.readFileSync('./data/products.json', 'utf-8');
        const products = JSON.parse(data);

        const product = products.find(p => p.id === parseInt(productId));

        if (product) {
            res.json(product);
        } else {
            // => error
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
});

router.post('/', (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails" });
        }

        const data = fs.readFileSync('./data/products.json', 'utf-8');
        const products = JSON.parse(data);

        const newProductId = generateProductId(products);

        const status = true;
        const thumbnailsArray = thumbnails || [];

        const newProduct = {
            id: newProductId,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails: thumbnailsArray
        };

        products.push(newProduct);

        fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error al agregar nuevo producto:", error);
        res.status(500).json({ error: "Error al agregar nuevo producto" });
    }
});

router.put('/:pid', (req, res) => {
    try {
        const productId = parseInt(req.params.pid);

        const { title, description, code, price, stock, category, thumbnails } = req.body;

        const data = fs.readFileSync('./data/products.json', 'utf-8');
        let products = JSON.parse(data);

        const index = products.findIndex(product => product.id === productId);

        if (index !== -1) {
            products[index] = {
                ...products[index],
                title,
                description,
                code,
                price,
                stock,
                category,
                thumbnails
            };

            fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

            res.json(products[index]);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// Eliminar un producto por su id
router.delete('/:pid', (req, res) => {
    try {
        const productId = parseInt(req.params.pid);

        const data = fs.readFileSync('./data/products.json', 'utf-8');
        let products = JSON.parse(data);

        const index = products.findIndex(product => product.id === productId);

        if (index !== -1) {
            products.splice(index, 1);

            fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

            res.json({ message: "Producto eliminado exitosamente" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

module.exports = router;
