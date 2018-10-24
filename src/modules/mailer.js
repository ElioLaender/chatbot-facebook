const nodemailer = require('nodemailer');
//auxilia no trabalho com caminhos
const path = require('path');
//auxilia na criação do template do email
const hbs = require('nodemailer-express-handlebars');
//recuperando informações de configuração de envio
const {host, port, user, pass} = require('../config/mail.json');

const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass
    }
  });


  //configurando o template do email a ser enviado
  transport.use('compile', hbs({
      viewEngine: 'handlebars',
      viewPath: path.resolve('./resources/mail'),
      extName: '.html',
  })
);
  module.exports = transport;