const router = require('express').Router();
const { getProducts, getProductWithId } = require('./product');

router.get('/unprotected', (req, res) => {
    res.send('This is a unprotected route');
});

router.get('/products', getProducts);

router.get('/products/:id', getProductWithId);

module.exports = router;