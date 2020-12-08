# Como implementei login com autenticação de usuários

Desenvolver o login com autenticação foi uma parte do [projeto](https://github.com/malufell/meu-caderno-de-receitas) que estou desenvolvendo para aprender programação! A estruturação foi bem desafiadora para os meus conhecimentos de iniciante, então criei este repositório para compartilhar o que funcionou pra mim :smiley:

Parte dos meus estudos é didicada a escrever e compartilhar o que estou aprendendo, então compartilho aqui também o texto onde registrei o que aprendi. 

**Conteúdo:**
- [Começando pelo resultado final](#começando-pelo-resultado-final)
- [Dependências e tecnologias](#dependências-e-tecnologias)
- [Como rodar a aplicação](#como-rodar-a-aplicação)
- [Tutorial](#tutorial)
  - [Começando pela tela de login - front end](#começando-pela-tela-de-login---front-end)
  - [Sobre o processo de autenticação - passport, connect-flash, express-session, uuid](#sobre-o-processo-de-autenticação---passport-connect-flash-express-session-uuid)
  - [Estratégia de autenticação local e middleware](#estratégia-de-autenticação-local-e-middleware)
  - [Configurando a rota de login e as mensagens flash](#configurando-a-rota-de-login-e-as-mensagens-flash)
  - [Configurando as sessões](#configurando-as-sessões)
  - [Configurando o logout](#configurando-o-logout)
  - [Incluindo a autenticação nas configurações do express](#incluindo-a-autenticação-nas-configurações-do-express)
  - [Criando uma rota que só pode ser acessada após login](#criando-uma-rota-que-só-pode-ser-acessada-após-login)
  - [Finalmente, o resultado!!](#finalmente-o-resultado)
  - [Concluindo](#concluindo)

<br>



## Começando pelo resultado final

:heart_eyes:

- somente após login a rota "/autenticada" fica disponível e se eu fizer logout perderei o acesso a essa página:

![autenticacao](https://user-images.githubusercontent.com/62160705/101485669-3aa96b00-393a-11eb-9080-dba829d0a028.gif)

<br>



- envio de mensagens para view configurado com o connect-flash:
  - usuário inválido
  - senha inválida
  
  ![msglogin](https://user-images.githubusercontent.com/62160705/101486041-d20ebe00-393a-11eb-9ad5-b92d6613985f.gif)
  
 
  
---
  
## Dependências e tecnologias

NodeJS com Express, EJS, Sequelize, Postgres e Body-Parser.

Para autenticação:

- `passport`: instala o middleware de autenticação;
- `passport-local`: define a estratégia que será utilizada para login (usuário e senha);
- `connect-flash`: gerencia as mensagens enviadas ao usuário;
- `express-session`: cria as sessões em uma aplicação Express;
- `uuid`: gera strings aleatórias que serão utilizadas como ID de cada sessão.

---

## Como rodar a aplicação

1. No terminal, clonar o projeto: `git clone https://github.com/malufell/autenticacao-com-passport-express-session.git`

2. Entrar na pasta do projeto: `cd autenticacao-com-passport-express-session`

3. Instalar as dependências: `npm install`

4. Configurar o postgres: 

No arquivo `config.json` da pasta "config" é necessário atualizar as informações abaixo conforme o postgres instalado no seu PC:

```javascript
{
  "development": {
    "username": "postgres",
    "password": "admin",
    "database": "tutorial",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

5. Rodar a migração do Sequelize para criar a tabela no banco de dados: `npx sequelize-cli db:migrate`

6. Atualizar os seeds para incluir registros de teste na tabela: `npx sequelize-cli db:seed:all`

7. Rodar a aplicação: `npm start`

---

## Tutorial

Em textos anteriores compartilhei como aprendi o fluxo de informações entre o usuário e o back end. Partindo disto, meu próximo passo no projeto foi implementar a solução de login.

Minha frustração com essa etapa começou porque a documentação do passport reforça o quanto é simples implementar a autenticação, mas com meu background de iniciante, não foi assim tão simples não :cold_sweat: 

**Conteúdo**

1. [Começando pela tela de login - front end](#começando-pela-tela-de-login---front-end)
2. [Sobre o processo de autenticação - passport, connect-flash, express-session, uuid](#sobre-o-processo-de-autenticação---passport-connect-flash-express-session-uuid)
3. [Estratégia de autenticação local e middleware](#estratégia-de-autenticação-local-e-middleware)
4. [Configurando a rota de login e as mensagens flash](#configurando-a-rota-de-login-e-as-mensagens-flash)
5. [Configurando as sessões](#configurando-as-sessões)
6. [Configurando o logout](#configurando-o-logout)
7. [Incluindo a autenticação nas configurações do express](#incluindo-a-autenticação-nas-configurações-do-express)
8. [Criando uma rota que só pode ser acessada após login](#criando-uma-rota-que-só-pode-ser-acessada-após-login)
9. [Finalmente, o resultado!!](#finalmente-o-resultado)
10. [Concluindo](#concluindo)


---

### Começando pela tela de login - front end

Busquei nos templates do bootstrap uma solução para a minha tela de login e encontrei [este modelo aqui](https://getbootstrap.com/docs/4.5/examples/sign-in/). Feito o download (HTML e CSS), fiz as adaptações necessárias da seguinte forma:

- Busquei uma imagem de usuário para utilizar na tela de login e fiz a edição do texto conforme o que eu gostaria de exibir aos meus futuros usuários :sunglasses:
- Configuei o método POST do formulário;
- Configurei a `div` que receberia as mensagens de erro durante as tentativas de login:

```ejs
<div>
	<% for (let i=0; i<errors.length; i++) { %>
	<div class="alert alert-danger" role="alert"><%= errors[i]%></div>
	<% } %>
</div>
```
<br>

- Assim ficou o arquivo `login.ejs`, salvo dentro da pasta "views":

```ejs
<!doctype html>
<html lang="pt-br">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
        integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <link href="styles/signin.css" rel="stylesheet">
    <title>Login · Meu caderno de Receitas</title>
</head>

<body class="text-center">
    <form action="/login" method="post" class="form-signin">
        <img class="mb-4" src="images/user.png" alt="usuario" width="90" height="90">
		<h1 class="h3 mb-3 font-weight-normal">Insira seus dados:</h1>
		
        <div>
            <% for (let i=0; i<errors.length; i++) { %>
            <div class="alert alert-danger" role="alert"><%= errors[i]%></div>
            <% } %>
        </div>
		
        <label for="inputEmail" class="sr-only">Email</label>
        <input type="email" name="email" id="inputEmail" class="form-control" placeholder="Email" required autofocus>
		
        <label for="inputPassword" class="sr-only">Senha</label>
        <input type="password" name="senha" id="inputPassword" class="form-control" placeholder="Senha" required>
		
        <button class="btn btn-lg btn-primary btn-block" type="submit">Login</button>
		
        <p class="mt-5 mb-3 text-muted">&copy; 2020 · <strong>Meu caderno de Receitas</strong> </p>
    </form>
</body>
</html>
```

<br>

- Arquivo `signin.css`, salvo dentro da pasta "public" > "styles". Essa configuração já veio no template e eu não fiz alterações:

```css
html,
body {
  height: 100%;
}
body {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
}
.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
}
.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.bd-placeholder-img {
    font-size: 1.125rem;
    text-anchor: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
@media (min-width: 768px) {
    .bd-placeholder-img-lg {
        font-size: 3.5rem;
    }
}
```

- Resultado:

![login](https://user-images.githubusercontent.com/62160705/101349863-b89f4080-386c-11eb-842e-b7c960c52911.png)

:heart_eyes:

--- 

### Sobre o processo de autenticação - passport, connect-flash, express-session, uuid

Como [consta na documentação](http://www.passportjs.org/docs/authenticate/): 

*[Passport](http://www.passportjs.org/) é um middleware de autenticação para Node.js, pode ser inserido em qualquer aplicativo da web baseado no Express de forma discreta. Um conjunto abrangente de estratégias de suporte à autenticação usando um nome de usuário e senha, Facebook, Twitter e muito mais.*

O processo de autenticação [possui 3 etapas](http://www.passportjs.org/docs/configure/): 

1. Estratégia de autenticação: pode ser definida localmente, ou permite login com dados de outras aplicações;
2. Middleware: faz a inicialização do passport na aplicação;
3. Sessão: criada para armazenar os dados da autenticação que foi realizada com sucesso, assim o usuário pode navegar entre as páginas autorizadas sem ficar reenviando seus dados.

:bulb: obs.: [esse texto aqui](http://toon.io/understanding-passportjs-authentication-flow/) tem uma excelente explicação sobre como funciona o processo de autenticação e foi através dele que entendi mais detalhes do assunto.

As seguintes dependências serão utilizadas projeto:

- `passport`: instala o middleware de autenticação;
- `passport-local`: define a estratégia que será utilizada para login (usuário e senha);
- `connect-flash`: gerencia as mensagens enviadas ao usuário;
- `express-session`: cria as sessões em uma aplicação Express;
- `uuid`: gera strings aleatórias que serão utilizadas como ID de cada sessão.

Comando para instalação: `npm install passport passport-local connect-flash express-session uuid`.

Agora vou por partes!

---

### Estratégia de autenticação local e middleware

- No meu projeto configurei uma estratégia de **autenticação local**, que acontecerá através de verificação de usuário e senha:
	- Por padrão, se a autenticação falhar, o Passport responderá com um `401 Unauthorized status` e quaisquer manipuladores de rota adicionais não serão chamados;
	- Se a autenticação for bem-sucedida, o próximo manipulador será chamado e a propriedade `req.user` será definida para o usuário autenticado;

- Um redirecionamento é comumente emitido após a autenticação de uma solicitação: 
	- após a autenticação bem-sucedida, o usuário pode ser redirecionado para a página inicial, por exemplo;
	- se a autenticação falhar, o usuário pode ser redirecionado de volta à página de login para outra tentativa.

- Os redirecionamentos costumam ser combinados com mensagens instantâneas para exibir informações de status ao usuário, e é aí que entra o [connect-flash](https://www.npmjs.com/package/connect-flash), recurso que irei utilizar para as mensagens da aplicação:

*O flash é normalmente usado em combinação com redirecionamentos, garantindo que a mensagem esteja disponível para a próxima página a ser processada. As mensagens são gravadas no flash e apagadas após serem exibidas para o usuário.* ... *o uso de mensagens flash requer uma função `req.flash()`. O Express 2.x fornecia essa funcionalidade, mas foi removida do Express 3.x. O uso de middleware connect-flash é recomendado para fornecer essa funcionalidade ao usar o Express 3.x.*

Dito isto, bora pro código:

- Dentro da pasta "config" criei um arquivo chamando `autenticacao.js`, com a configuração do passport:

```javascript
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const database = require('../models');
const flash = require('connect-flash');


module.exports = (app) => {
	passport.use('local', new Strategy(
		{   
			usernameField: 'email',
			passwordField: 'senha',
		},
		function (email, senha, done) {
			database.Usuarios.findOne({ where: { email: email } }).then(function (usuario) {
				if (!usuario) {
					return done(null, false, { message: 'Usuário não encontrado' });
				}
				if (usuario.senha != senha) {
					return done(null, false, { message: 'Senha inválida' });
				}
				return done(null, usuario);
			})
		}
	))
	
	app.use(passport.initialize());
	app.use(flash());
};
```

Onde:

- `passport.use()` recebe uma instância da estratégia de autenticação (`new Strategy`), sendo que o construtor recebe dois parâmetros:
	- objeto informando quais campos serão considerados na estratégia de login (`email` e `senha`);
	- uma função que realizará a autenticação;
- essa função recebe email, senha e o done (que é executado ao fim do processo de autenticação);
- inicialmente haverá a busca na tabela `Usuarios` por dados que correspondam ao informado no campo `email`;
- logo na sequência uma condição:
	- se não houver usuário (`(!usuario)` por isso a negação), retorna a mensagem "usuario não encontrado";
	- se houver usuário, verifica se a senha informada corresponde com a senha no banco;
	- se a senha não corresponde, retorna a mensagem "senha inválida";
	- se as credenciais forem válidas, o retorno de chamada de verificação invoca `done` para informar ao Passport que o usuário foi autenticado;
- o `done()` recebe como parâmetro `null` e `false` quando há falha na autenticação, `null` porque não há um erro no retorno e `false` para indicar que houve falha na autenticação.

- por fim, há a inicialização do passport (`passport.initialize()`) e do flash para envio das mensagens (`flash()`).

Obs.: o código está dentro de `module.exports` pois futuramente deverá ser importado no arquivo `server.js` de configuração do express, caso contrário não irá funcionar. 

<br>

Obs.: este método é uma variação do que foi encontrado na [documentação](http://www.passportjs.org/docs/configure/), onde há uma explicação mais detalhada sobre as etapas :)

---

### Configurando a rota de login e as mensagens flash

Durante o processo de autenticação os redirecionamentos estão configurados na rota POST de login.

- Pasta "routes", arquivo `login.js`:

```javascript
const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
}), (req, res, next) => {
    res.redirect('/autenticada');
})
```

Onde:

- em `passport.authenticate('local'`, `local` é a indicação da minha estratégia de autenticação;
- `failureFlash` com a opção `true` é para instruir o Passport a exibir as mensagens de erro configuradas no método de autenticação;
- se houver falha na autenticação, o usuário voltará para tela de login: `failureRedirect: '/login'`;
- se houver sucesso na autenticação, o usuário será redirecionado para o endereço `/autenticada` que será criada para teste;

Obs.: é possível enviar dados do usuário no redirecionamento. Por exemplo, ao invés de ir para rota `/autenticada`, o usuário poderia ser redirecionado para uma página que exibe seus dados, com o envio do ID dele junto no redirecionamento (porque o ID está salvo na sessão :wink:), ficaria assim: `res.redirect('/usuario/' + req.user.id)`. Como envolve o método de busca de usuários, vou comentar sobre isso em outro texto! 

<br>

A rota de login com o método GET está configurada para renderizar a página "login" e receber do `req.flash` as mensagens de falha na autenticação:

```javascript
router.get('/login', (req, res, next) => {
    const msgs = req.flash();
    const errors = msgs.error || [];
    res.render('login', { errors }); 
});
```

Existe um detalhe muito importante sobre as mensagens flash, como informado [aqui](https://www.npmjs.com/package/connect-flash): **as mensagens são gravadas no flash e apagadas após serem exibidas para o usuário.**

Isto significa que cada mensagem aparece somente uma vez, portanto, se para fins de teste eu usar `console.log` no método de autenticação para ver se a mensagem está funcionando, ela não será exibida no navegador, porque já foi exibida uma vez no console.log!!

Não sei dizer quanto tempo eu perdi até descobrir isso :joy: :joy:

Enfim, vou compartilhar mais detalhes no texto sobre cadastro de usuários, pois foi quando eu precisei usar o `req.flash` duas vezes e acabei caindo nesse mesmo problema mas indo por um outro caminho!!
					
---

### Configurando as sessões

[Sessões](http://www.passportjs.org/docs/configure/): *em um aplicativo da Web típico, as credenciais usadas para autenticar um usuário serão transmitidas apenas durante a solicitação de login. Se a autenticação for bem-sucedida, uma sessão será estabelecida e mantida por meio de um cookie definido no navegador do usuário.*

*Cada solicitação subsequente não conterá credenciais, mas sim o cookie exclusivo que identifica a sessão. Para oferecer suporte a sessões de login, o Passport serializará e desserializará as instâncias de usuário na sessão.*

- A sessão retorna um middleware, por isso é chamada com o método `use()` do express;
- a sessão receberá um objeto contendo uma [série de propriedades](https://www.npmjs.com/package/express-session);

Arquivo `autenticacao.js` da pasta "config", a configuração da sessão foi colocada acima do método de autenticação do passport:

```javascript
const { v4: uuidv4 } = require('uuid');
const passport = require('passport')
const Strategy = require('passport-local').Strategy;
const database = require('../models')
const sessao = require('express-session');
const flash = require('connect-flash')

module.exports = (app) => {
    app.use(sessao({
        secret: "palavrasecreta",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
        genid: function (req) {
            return uuidv4();
        }
    }));

    passport.use('local', new Strategy(
    
    //...continua config. do passport
    
    app.use(passport.initialize());
    app.use(passport.session()); //nova configuração incluída
    app.use(flash());
}
```

- [secret](https://www.npmjs.com/package/express-session#secret):  é o segredo usado para assinar o cookie de ID de sessão, recebe como valor uma string (essa string, normalmente gerada de maneira aleatória e guardada em um arquivo de configuração da aplicação, servirá para identificar/assinar a sessão);
- [resave](https://www.npmjs.com/package/express-session#resave): essa propriedade força a sessão a ser salva de volta no armazenamento de sessão - mesmo se a sessão nunca foi modificada durante a solicitação - por isso recebe `false` já que não há essa necessidade;
- [saveUninitialized](https://www.npmjs.com/package/express-session#saveuninitialized): recebe `false` para que a aplicação não gere uma sessão para todos os usuários que acessarem qualquer página, mas sim somente após a efetivação do login;
- [cookie](https://www.npmjs.com/package/express-session#cookie): o "secure" assegura que o navegador só envie o cookie por HTTPS, por isso foi configurado como `false`
- [genid](https://www.npmjs.com/package/express-session#genid): Fornece uma função que retorna uma string que será usada como um ID de sessão. Aqui é onde entra o uso da dependência uuid;
- [uuuid](https://www.npmjs.com/package/uuid#uuidv4options-buffer-offset): módulo que irá gerar as strings aleatórias utilizadas como ID da sessão.

Por fim, a chamada para inicialização da sessão: `app.use(passport.session());`

<br>

Agora que a sessão está configurada, é hora de definir quais dados serão armazenados na sessão, com `serializeUser` e `deserializeUser`:

- No arquivo `autenticacao.js` da pasta "config":
```javascript
module.exports = (app) => {

	 //...configuração da sessão

	//...método de autenticação

    passport.serializeUser(function (usuario, done) {
        done(null, usuario.id);
    });

    passport.deserializeUser(function (id, done) {
        database.Usuarios.findOne({ where: { id: id } }).then(function (usuario) {
            done(null, usuario);
        });
    });

	//...middlewares
}
```

**Serialização:**

- A partir do objeto `passport`, será chamada a função `serializeUser()`, que recebe outra função com o usuário autenticado e o done;
- A função `done()` recebe `null` na primeira posição (pois não há erro) e depois a informação do usuário que será armazenada na sessão, neste caso é o `id`;

**Desserialização:**

- Função também chamada a partir do objeto `passport`, recebe outra função com o a informação que foi serializada e o done;
- Depois os dados do usuário são resgatados do banco de dados;

Porque a desserialização envolve uma consulta no banco de dados? Foi o que eu me perguntei...

Como comentado [aqui](http://toon.io/understanding-passportjs-authentication-flow/): *`passport.deserializeUser` é invocado em cada solicitação por `passport.session`. Ele nos permite carregar informações adicionais do usuário em cada solicitação. Este objeto de usuário é anexado à solicitação `req.user` para torná-lo acessível em nosso tratamento de solicitação.*

E [aqui](http://www.passportjs.org/docs/configure/): *Neste exemplo, apenas o ID do usuário é serializado para a sessão, mantendo pequena a quantidade de dados armazenados na sessão. Quando as solicitações subsequentes são recebidas, este ID é usado para localizar o usuário, que será restaurado em `req.user`.*

Então, a cada solicitação enviada os dados do usuário são restaurados em `req.user`, por isso acontece a consulta no banco dedos.

---

### Configurando o logout

O logout nada mais é do que o encerramento da sessão que foi criada após a autenticação.

- no arquivo `login.js` da pasta "routes", incluir a rota `/logout`:

```javascript
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/')
    })
});
```

Essa rota não terá nenhuma página renderizada, ela apenas destroi a sessão e redireciona o usuário para a página inicial da aplicação.

Obs.: eu também percebi que o nome do arquivo é login mas contempla login e logout :sweat:

---

### Incluindo a autenticação nas configurações do express

Feita toda essa configuração, é hora de incluir a autenticação no arquivo de configuração da aplicação `server.js`:

```javascript
//...demais importações
const autenticacao = require('../app/config/autenticacao');

autenticacao(app);

//...demais configurações

```

---

### Criando uma rota que só pode ser acessada após login

Hora de criar uma rota que dependa de autenticação para acesso!

- no arquivo `usuarios.js` da pasta "routes", criei uma rota para testar se tudo isso está funcionando:

```javascript
//rota utilizada para teste da autenticação
router.get('/autenticada', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.render('autenticada');
    } else {
        res.redirect('/login');
    }
});
```

Há uma condição que verifica se `req.isAuthenticated` é verdadeiro, em caso positivo renderiza a página autenticada, caso negativo redireciona para tela de login.

- dentro da pasta "views", criar um arquivo `autenticada.ejs` para poder renderizar no teste:

```ejs
<h1>página que se pode ser acessada com login</h1>

<a href='/'>voltar página inicial</a>
```

---

### Finalmente, o resultado!!

Eita que eu me empolguei e fiz até vídeo :joy:

- Primeiro, vou testar se a autenticação está funcionando, então: somente após login a rota "/autenticada" fica disponível e se eu fizer logout perderei o acesso a essa página:

![autenticacao](https://user-images.githubusercontent.com/62160705/101485669-3aa96b00-393a-11eb-9080-dba829d0a028.gif)

<br>

- Segundo, vou testar o envio de mensagens para view (configuradas com o `req.flash`):
	- usuário inválido;
	- senha inválida;


![msglogin](https://user-images.githubusercontent.com/62160705/101486041-d20ebe00-393a-11eb-9ad5-b92d6613985f.gif)


---

### Concluindo

De tudo o que aprendi até o momento, a parte de autenticação foi uma das que mais fiquei feliz por conseguir concluir. Foi um dos pontos de maior pesquisa até chegar em um resultado satisfatório :muscle: :smiley: 

São muitas etapas até finalizar o processo... Fica difícil encontrar um erro pelo meio do caminho, acho que esse foi o ponto mais complicado para mim.

Enfim, a vida de iniciante em programação não é fácil, mas cheia de pequenas vitórias :heart_eyes:

Até a próxima!

