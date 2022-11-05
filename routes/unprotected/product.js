const { SanityClient } = require('../config');

const getProducts = (req, res) => {
    const query = `*[_type == "product"]`;
    SanityClient.fetch(query).then(async (products) => {
        if (products.length == 0)
            return res.status(400).send({ error: "No products found" });
        return res.status(200).send(products);
    });
};

const getProductWithId = (req, res) => {
    const query = `*[_type == "product" && _id == "${req.params.id}"]`;
    SanityClient.fetch(query).then(async (products) => {
        if (products.length == 0)
            return res.status(400).send({ error: "No products found" });
        return res.status(200).send(products);
    });
};

module.exports = { getProducts, getProductWithId };