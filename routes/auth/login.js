const { SanityClient } = require('../config');
const bcrypt = require("bcrypt");

const login = async (req, res) => {
    const body = req.body;
    if (!(body.email && body.password)) {
        return res.status(400).send({ error: "Data not formatted properly" });
    }
    const query = `*[_type == "user" && email == "${body.email}"]`;
    SanityClient.fetch(query).then(async (user) => {
        if (user.length > 0) {
            const password = user[0].password;
            const match = await bcrypt.compare(body.password, password);
            if (match) {
                req.session.email = user[0].email;
                req.session.save(function (err) {
                    if (err) return next(err);
                    return res.redirect('/');
                    // return res.status(200).send({ message: "Login successful" });
                });
            }
            else {
                return res.status(400).send({ error: "Incorrect password" });
            }
        }
        else {
            return res.status(400).send({ error: "User doesn't exist" });
        }
    });
}

module.exports = login;