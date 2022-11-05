const router = require('express').Router();

router.get('/protected', (req, res) => {
    if (!req.session.email)
        return res.status(401).send({ error: "Unauthorized" });
    else
        return res.status(200).send({ message: `This is protected route is being accessed by ${req.session.email}` });
});

module.exports = router;