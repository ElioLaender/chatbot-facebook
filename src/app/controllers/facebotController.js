const express = require('express');
const chatbotFacebook = require('../../modules/chatbotFacebook');
const router = express.Router();
const faceBot = new chatbotFacebook();

router.get('/', async (req, res) => {
    if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'SxPAGFZFFw'){
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
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
                        faceBot.sendFirstMenu(event.sender.id);
                        setTimeout(() => { 
                            faceBot.enableTipeOn(event.sender.id);
                            faceBot.treatMessage(event); 
                        }, 1500);
                        
                    } else {

                        console.log('-----------------------------');
                        console.log(event.postback.payload);
                        
                        if(event.postback && event.postback.payload){
                           switch(event.postback.payload){
                                case 'started_chat':
                                  faceBot.enableTipeOn(event.sender.id);
                                  faceBot.sendTextMessage(event.sender.id, `Oi! Sou a Melisa, assistente virtual da WantBack!`);
                                  faceBot.sendFirstMenu(event.sender.id);
                                  faceBot.webview(event.sender.id);
                                break;
                                case 'saber_mais':
                                faceBot.sendTextMessage(event.sender.id, 'Nos somos uma empresa de descontos!');
                                faceBot.showOptionsMenu(event.sender.id);
                                break;

                                default:
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