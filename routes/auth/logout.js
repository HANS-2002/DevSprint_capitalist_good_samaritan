const logout = (req, res) => {
    req.session.destroy();
    res.status(200).send({ message: "Logout successful" });
};

module.exports = logout;