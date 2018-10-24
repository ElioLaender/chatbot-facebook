//chamada ao express para instanciar Router
const express = require('express');
//chamada ao model do user
const User = require('../models/userModel');
//Biblioteca para criptografia
const bcrypt = require('bcryptjs');
//Biblioteca para trabalhar com jwt
const jwt = require('jsonwebtoken');
//trabalhar com crypto
const crypto = require('crypto');
//importando json contendo o secret para geração do token
const authConfig = require('../../config/auth');
//chamando o template de email
const mailer = require('../../modules/mailer');

//Recebendo as funcionalidades de rotas do express
const router = express.Router();

//Função para gerar os tokens
function generateToken(params = {}){
  
    //gerando token de autenticação
    return jwt.sign(params, authConfig.secret, {
        //token expira em um dia
        expiresIn: 86400,
    });

}

//Rota de cadastro
router.post('/register', async (req, res) => {

    const {email} = req.body;
    try {

        //Verifica se usuário já existe
        if(await User.findOne({email}))
            return res.status(400).send({'error': 'User already exists'});

        const user = await User.create(req.body);

        //removendo o campo senha do objeto user
        user.password = undefined;

        return res.send({
            user,
            token: generateToken({id: user.id}),
        });

    } catch (err) {
        return res.status(400).send({error: 'Registration failed'});
    }
});

router.post('/authenticate', async (req, res) => {
    
    const { email, password } = req.body;

    //necessário utilizar o select, pois o retorno do campo password é omitido, confirme configurado no Schema responsável pela coleção User. 
    const user = await User.findOne({email}).select('+password');

    if(!user)
      return res.status(400).send({error: 'User not foound'});

    //verifica se a senha informada bate coom a criptografia  
    if (!await bcrypt.compare(password, user.password))
      return res.status(400).send({error: 'Invalid password'});

    //removendo o campo senha do objeto user
    user.password = undefined;


    //caso contrário retorno usuário normalmente
    res.send({
        user,
        token: generateToken({id: user.id}),
    });
});


//Rota responsável por tratamento caso usuário tenha esquecido a senha, enviando um token autorizando o reset do email
router.post('/forgot_password', async (req, res) => {

    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if(!user)
          return res.status(400).send({ error: 'User not found'});
        
        //gera um token contendo 4 bytes e 8 caracteres aleatório para atender a requisição
        const token = crypto.randomBytes(4).toString('hex');
        //seta o tempo de expiração deste token
        const now = new Date();
        now.setHours(now.getHours() + 1);

        //alterando informações do usuário
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'laenderquadros@gmail.com',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if(err){
                return res.status(400).send({error: 'Cannot send forgot password email'});
            }
            //caso não exista erro, retorna normalmente
            return res.send();  
        });

        //console.log(token, now);

    } catch (err) {
        res.status(400).send({error: 'Erro on forgot password, try again'});
    }

});

//Lógica responsável por resetar a senha do usuário
router.post('/reset_password', async (req, res) => {

    const { email, token, password } = req.body;

    try {

      const user = await User.findOne({email})
       //precisamos explicitar o que foi configurado para não retornar no Schema
      .select('+passwordResetToken passwordResetExpires');

      if(!user)
        return res.status(400).send({error: 'User not found'});

      if(token !== user.passwordResetToken)
        return res.status(400).send({error: 'Token invalid' });

      const now = new Date();

      //verifica se o token de reset expirou
      if(now > user.passwordResetExpires)
        return res.status(400).send({error: 'Token expired, generate a new one'});
        
      //Caso tudo ocorra bem, o password do usuário é alterado. 
      user.password = password;
      
      //salva alteração no banco de dados.
      await user.save();

      //retorna uma resposta contendo status 200 ok
      res.send();

    } catch (err) {
        res.status(400).send({ error: 'Cannot reset password, try again'});
    }
})

/*
Como no index do core da nossa aplicação tornamos o app do express acessível para o controller, agora podemos/
acessar propriedades do app, assim sendo, estamos atribuindo um middleware para chamada de /auth passando o router
por parâmetro, dessa forma todas as rotas criadas dentro de router serão prefixadas com 'auth'.
*/
module.exports = app => app.use('/auth', router);