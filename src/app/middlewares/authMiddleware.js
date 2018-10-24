const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');


//Interceptando requisição do usuário pelo middleware
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if(!authHeader)
      return res.status(401).send({ error: 'No token provided'});

      //verifica se o token se encontra dentro dos padrões esperados. 
      const parts = authHeader.split(' ');

      //verifica se o split getou um  array de duas posições. 
      if(!parts.length === 2)
        return res.status(401).send({ error: 'Token error'});

      //utilizando o conceito de desestruturação do ES6 para extrair os valores do array emvariáveis
      const [ scheme, token ] = parts;
      
      //verificando se a const scheme inicia com Bearrer com uso de expressão regular
      if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({ error: 'Token malformated'});

      //verificando se o token informado é válido. 'decoded' é o id do usuário para o caso do token estar correto
      jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) 
          return res.status(401).send({ error: 'Token invalid'});
          
          req.userId = decoded.id;
          return next();
      });  
      
};