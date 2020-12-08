const bodyParser = require('body-parser');
const base = require('./base');
const login = require('./login');

module.exports = app => {
    app.use(
        bodyParser.json(),
        base,
        login
    );
};