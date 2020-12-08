const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index');
});

router.get('/autenticada', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.render('pagina-autenticada');
    } else {
        res.redirect('/login');
    }
});

module.exports = router;