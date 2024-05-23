const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function generateCartId(carts) {
    if (carts.length === 0) {
        return 1;
    }

    const maxId = carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0);

    for (let i = 1; i <= maxId; i++) {
        const idExists = carts.some(cart => cart.id === i);
        if (!idExists) {
            return i;
        }
    }

    return maxId + 1;
}


router.post('/', (req, res) => {
    try {
        const data = fs.readFileSync('./data/carts.json', 'utf-8');
        const carts = JSON.parse(data);

        const newCartId = generateCartId(carts);
        
        const newCart = {
            id: newCartId,
            products: [] 
        };

        carts.push(newCart);

        fs.writeFileSync('./data/carts.json', JSON.stringify(carts, null, 2), 'utf-8');

        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear un nuevo carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al crear un nuevo carrito." });
    }
});

router.get('/:cid', (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const data = fs.readFileSync('./data/carts.json', 'utf-8');
        const carts = JSON.parse(data);

        const cart = carts.find(cart => cart.id === cartId);

        if (cart) {
            res.json(cart.products);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al listar productos del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al listar productos del carrito" });
    }
});

router.post('/:cid/product/:pid', (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);

        const data = fs.readFileSync('./data/carts.json', 'utf-8');
        let carts = JSON.parse(data);
        const cartIndex = carts.findIndex(cart => cart.id === cartId);

        if (cartIndex !== -1) {
            const cart = carts[cartIndex];

            const productIndex = cart.products.findIndex(product => product.id === productId);

            if (productIndex !== -1) {
                cart.products[productIndex].quantity++;
            } else {
                cart.products.push({ id: productId, quantity: 1 });
            }

            fs.writeFileSync('./data/carts.json', JSON.stringify(carts, null, 2), 'utf-8');
            res.json(cart);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al agregar un producto al carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al agregar un producto al carrito" });
    }
});


router.delete('/:cid', (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);

        const data = fs.readFileSync('./data/carts.json', 'utf-8');
        let carts = JSON.parse(data);

        const index = carts.findIndex(cart => cart.id === cartId);

        if (index !== -1) {
            // eliminar
            carts.splice(index, 1);

            fs.writeFileSync('./data/carts.json', JSON.stringify(carts, null, 2), 'utf-8');

            res.json({ message: "Carrito eliminado exitosamente" });
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar el carrito:", error);
        res.status(500).json({ error: "Error al eliminar el carrito" });
    }
});

router.get('/', (req, res) => {
    try {
        const data = fs.readFileSync('./data/carts.json', 'utf-8');

        const carts = JSON.parse(data);
        
        res.json(carts);
    } catch (error) {
        console.error("Error al leer los carritos:", error);
        res.status(500).json({ error: "Error al leer los carritos" });
    }
});

module.exports = router;
