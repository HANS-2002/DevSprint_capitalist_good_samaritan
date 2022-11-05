const router = require('express').Router();
const signup = require('./signup');
const login = require('./login');
const logout = require('./logout');

// POST /auth/signup -> To sign up a new user
router.post("/signup", signup);

// POST /auth/login -> To login a user
router.post("/login", login);

// GET /auth/logout -> To logout a user
router.get("/logout", logout);

module.exports = router;