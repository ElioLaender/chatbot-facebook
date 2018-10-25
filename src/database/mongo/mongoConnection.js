//Definindo a conexão com nossa base de dados. 
const mongoose = require('mongoose');
const urlConnection = 'mongodb://adalaender:dba141519@naboo.mongodb.umbler.com:39137/dbsale';

mongoose.connect(urlConnection, {useNewUrlParser: true}).then(
    () => {mongoose.Promise = global.Promise; },
    err => { console.log(e) }
  );

//Escutando evento de conexão
mongoose.connection.on('connected', () => {
    console.log(`Mongoose conectado`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose foi desconectado');
});

mongoose.connection.on('error', (err) => {
    console.log(`Mongoose retornou um erro: ${err}`);
});

//encerrando conexão após algum processo
mongoose.connection.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log(`Mongoose foi encerrado!`);
        //indica que o processo terminou sem erros
        process.exit(0);
    })
    
});

module.exports = mongoose;