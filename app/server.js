const express = require('express');
const port = 3000;
const path = require('path');
const routes = require('./routes');
const app = express();
const bodyParser = require('body-parser');
const autenticacao = require('./config/autenticacao');

autenticacao(app);

app.use(bodyParser.urlencoded({
    extended: true
}));


//precisa ficar depois do bodyparser!! se não da erro no flash
routes(app);

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.listen(`${port}`, () => console.log(`servidor rodando na porta ${port}`));