//Arquivo responsável por tornar o app disponível para os controllers

//fileSystem: trabalhar com arquivos
const fs = require('fs');
//trabalha com caminhos
const path = require('path');

module.exports = app => {

    //realiza leitura do diretório
    fs
    //acessa arquivos do diretório atual. __dirname é o diretório atual.
    .readdirSync(__dirname)
    //filtra arquivos, onde o nome não começa com ponto(.) e nem seja este arquivo o index.js
    .filter(file => ((file.indexOf('.')) != 0 && (file !== 'indexController.js')))
    //carrega o app para dentro de cada arquivo controller retornado do diretório
    .forEach(file => require(path.resolve(__dirname, file))(app));
};