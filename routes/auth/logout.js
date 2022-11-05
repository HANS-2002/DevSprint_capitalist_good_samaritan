const logout = (req, res) => {
    req.session.destroy();
    return res.redirect('/');
    // res.status(200).send({ message: "Logout successful" });
};

module.exports = logout;