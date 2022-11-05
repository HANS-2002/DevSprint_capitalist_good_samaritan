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
            const salt = await bcrypt.genSalt(saltCount);
            const password = await bcrypt.hash(body.password, salt);
            let slug = body.email;
            slug = slug.replace('@', '-').toLowerCase();
            slug = slug.replace('.', '-').toLowerCase();
            let newUser = {
                "_type": "user",
                "_id": `${v4()}`,
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
                "slug": {
                    "_type": "slug",
                    "current": `${slug}`
                }
            }
            SanityClient.createOrReplace(newUser).then((createrUser) => {
                if (createrUser) {
                    console.log("User created");
                    return res.redirect('/login');
                }
                else {
                    return res.status(400).send({ error: "User not created" });
                }
            });
        }
    });
}

module.exports = signup;