const express = require('express');
const chatbotFacebook = require('../../modules/chatbotFacebook');
const router = express.Router();
const faceBot = new chatbotFacebook();
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

router.get('/', async (req, res) => {
    if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'SxPAGFZFFw'){
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

router.get('/teste', (req, res) => {
    Product.find({"categories": 'anabela'}, (err, product) => {
        res.send(faceBot.sendProducts(321321, product));
     });
});

//facebook vai mandar  as informações do chat via post
router.post('/', (req, res) => {
    const data = req.body;

    //verifica se é o facebook que está enviando. 
    if(data && data.object === 'page'){
        
        //Percorre todos os valores existentes em entry
        data.entry.forEach((entry) => {
            let pageId = entry.id;
            let timeOfEvent = entry.time;

            //itera pelas mensagens
            if(entry.messaging){
                entry.messaging.forEach((event) => {
                    if(event.message){
                        faceBot.enableMarkSeen(event.sender.id);
                        
                        setTimeout(() => { 
                            faceBot.enableTipeOn(event.sender.id);
                            faceBot.treatMessage(event); 
                        }, 1500);
                        
                    } else {
                        if(event.postback && event.postback.payload){
                           
                           //verifica se o postback foi gerado pelo menu de categoria, caso contrário dá continuidade no switch
                           if(event.postback.payload .indexOf("category_") != -1){

                            let posIni = event.postback.payload.indexOf('_') + 1,
                                posFim = event.postback.payload.length;
                            let catSelected = event.postback.payload.substring(posIni, posFim);
                            
                            faceBot.enableTipeOn(event.sender.id);
                                //Seleciona a categoria pelo slug, depois seleciona todas as categorias diretamente  filhas. 
                                Category.find({slug: catSelected}, (err, data) => {
                                    setTimeout(() => { 
                                        Category.find({parent: data}, (err, categories) => {
                                            //Caso houver categorias filhas, será gerado as categorias filhas, caso contrário exibe os produtos da categoria.
                                            if(categories != ''){
                                                faceBot.sendTextMessage(event.sender.id, `Olha! temos variedades.. 😊 - ${categories[0].slug}`);
                                                faceBot.menuCategory(event.sender.id, categories);
                                            } else {
                                                //faceBot.sendTextMessage(event.sender.id, `Deverá ser exibido`);
                                                //faceBot.enableTipeOn(event.sender.id);

                                                Product.find({"categories": 'anabela'}, (err, product) => {
                                                    faceBot.sendTextMessage(event.sender.id, `Olha! temos variedades..`);
                                                    faceBot.sendProducts(event.sender.id, product);
                                                });
                                            }
                                                
                                            });   
                                    }, 1500); 
                                });

                           } else {
                                switch(event.postback.payload){
                                    case 'started_chat':
                                        faceBot.enableTipeOn(event.sender.id);
                                        faceBot.sendTextMessage(event.sender.id, `Oi! Sou a Melisa, assistente virtual!`);
                                        faceBot.enableTipeOn(event.sender.id);
                                        setTimeout(() => { 
                                            faceBot.sendTextMessage(event.sender.id, `Deslize para ver as categorias! 👉📱`);
                                            Category.find({"parent": null}, (err, data) => {
                                                faceBot.menuCategory(event.sender.id, data);
                                            });
                                        }, 1500);   
                                    break;
                                    case 'saber_mais':
                                        faceBot.sendTextMessage(event.sender.id, 'Nos somos uma empresa de descontos!');
                                        faceBot.showOptionsMenu(event.sender.id);
                                    break;

                                    default:
                              }
                           }
                          
                        }
                    }
                });
            } 
         
        });

        //Retorna 200 para avisar o facebook que o post foi recebido
        res.sendStatus(200);
    } else {
        res.status(404).send('Não passou aqui');
    }

});

module.exports = app => app.use('/webhook', router);