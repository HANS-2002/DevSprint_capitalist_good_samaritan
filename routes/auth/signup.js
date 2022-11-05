const { SanityClient } = require('../config');
const bcrypt = require("bcrypt");
const saltCount = parseInt(process.env.SALT_COUNT, 10);
const { v4 } = require('uuid');

const signup = async (req, res) => {
    const body = req.body;
    if (!(body.email && body.password)) {
        return res.status(400).send({ error: "Data not formatted properly" });
    }
    const query = `*[_type == "user" && email == "${body.email}"]`;
    SanityClient.fetch(query).then(async (user) => {
        if (user.length > 0) {
            return res.status(400).send({ error: "User already exists" });
        }
        else {
            const newCart = {
                "_id": `${v4()}`,
                "_type": "userCart",
                "belongsTo": {
                    "_ref": "166f8e91-805b-4f1b-83ed-696f036055fd",
                    "_type": "reference"
                },
                "items": [],
                "title": "",
                "totalPrice": 0
            };
            SanityClient.createOrReplace(newCart).then(async (createdCart) => {
                if (createdCart) {
                    const salt = await bcrypt.genSalt(saltCount);
                    const password = await bcrypt.hash(body.password, salt);
                    let slug = body.email;
                    slug = slug.replace('@', '-').toLowerCase();
                    slug = slug.replace('.', '-').toLowerCase();
                    let newUser = {
                        "_type": "user",
                        "_id": `${v4()}`,
                        "cart": {
                            "_ref": `${createdCart._id}`,
                            "_type": "reference"
                        },
                        "displayPicture": {
                            "_type": "image",
                            "asset": {
                                "_ref": "image-f799dc0c55da7e52c65ddf4d78377bf076dee176-225x225-png",
                                "_type": "reference"
                            }
                        },
                        "email": `${body.email}`,
                        "name": `${body.name}`,
                        "password": `${password}`,
                        "phone": `${body.phone}`,
                        "slug": {
                            "_type": "slug",
                            "current": `${slug}`
                        }
                    }
                    SanityClient.createOrReplace(newUser).then((createrUser) => {
                        if (createrUser) {
                            const query = `*[_type == "userCart" && _id == "${createdCart._id}"]`;
                            SanityClient.fetch(query).then(async (cart) => {
                                cart[0].belongsTo._ref = createrUser._id;
                                cart[0].title = `Cart of ${createrUser.name}`;
                                SanityClient.createOrReplace(cart[0]).then((updatedCart) => {
                                    if (updatedCart) {
                                        return res.status(200).send({ message: "Signup successful" });
                                    }
                                    else {
                                        return res.status(400).send({ error: "Error updating cart" });
                                    }
                                });
                            });
                        }
                        else {
                            return res.status(400).send({ error: "User not created" });
                        }
                    });
                }
                else {
                    return res.status(400).send({ error: "Cart creation failed" });
                }
            });
        }
    });
}

module.exports = signup;