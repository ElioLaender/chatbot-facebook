'use strict';
const request = require('request');

function chatbotFacebook(){

    //Salvar no banco de dados, por enquando será em array
    this.statusCall = [];

    this.treatMessage = (event) => {

        //id do usuário
        let senderId = event.sender.id;
        let recipientID = event.recipient.id;
        let timeOfMessage = event.timestamp;
        let message = event.message;
        let messageId = message.mid;
        let messageText = message.text;
        let attachments = message.attachments;

        if(messageText){

            //Verifica qual o estado da conversa, pois algumas respostas podem mudar de acordo com o decorrer das mensagens. 
            if(this.statusCall[senderId]){

                //Age de acordo com o estado da conversa. 
                switch(this.statusCall[senderId]){
                    case 'segundo_ciclo':
                    //Continuação do atendimento, segundo contato//
                    switch(messageText){
                        case 'Sim':
                            this.sendTextMessage(senderId, 'Opa, pode falar. =)');
                        break;
                        
                        case 'não':
                            this.sendTextMessage(senderId, 'Obrigado por falar conosco! Estamos sempre a seu dispor.');
                        break;
        
                        default:
                            this.sendTextMessage(senderId, 'Infelizmente, não entendi o que disse. =( Irei perguntar para o pessoal aqui!');
                    }
                    ///////////////////////////////////////////////
                    break;

                    default:
                }

            } else {
                //Tratamendo de mensagens referente ao primeiro contato. 
                switch(messageText){
                    case 'oi':
                        this.sendTextMessage(senderId, 'Olá, tudo bem com você?');
                    break;
                    
                    case 'tchau':
                    //responder com tchau
                    break;
    
                    default:
                        this.sendTextMessage(senderId, 'Infelizmente, não entendi o que disse. =(');
                        this.enableTipeOn(senderId);
                        setTimeout(() => { 
                            this.menuHelp(senderId);
                        }, 1500);  
                }
            }
            
        } else if(attachments){
            console.log('arquivo recebido');
        }

    };

    //responsável por enviar um retorno para o chat
    this.callSendApi = (messageData, delay) => {

        setTimeout(() =>{

            request({
                //endereço de envio das respostas
                "uri": 'https://graph.facebook.com/v2.6/me/messages',
                "qs": { "access_token": 'EAADmfswl4QwBAD8pTJ0v5tuZAAHTDwwu2NsYZAZAdQRBhk7e6CcHXpwIJVduUcPmJbLBWBfmVZCzcwSVOL7IbxH7L8hkxYCEfJ3oZAxIxpK2jBSDd0WIZB2NvHyLkoxhmU2tNQdZALCjzNbCzyuBgTuCE9UosSfIpFN0RhYts2TowZDZD'},
                "method": 'POST',
                "json": messageData
            }, (error, response, body) => {
                if(!error && response.statusCode == 200){
                    console.log('mensagem enviada com sucesso');
                    let recipientID = body.recipient_id;
                    let messageID = body.message_id;
    
                } else {
                    console.log(`Não foi possível enviar a mensagem!
                    ${error}`);
                }
            });

        }, delay);
    }

    //https://developers.facebook.com/docs/messenger-platform/send-messages/sender-actions
    this.enableTipeOn = (recipientId) => {

        const messageData = {
            "recipient": {
                "id": recipientId
            },
            "sender_action":"typing_on",
        };

        this.callSendApi(messageData, 0);
    };

    this.enableMarkSeen = (recipientId) => {

        const messageData = {
            "recipient": {
                "id": recipientId
            },
            "sender_action":"mark_seen",
        };
        
        this.callSendApi(messageData, 0);
    };

    //Prepara mensagem antes de enviar, recebendo o id do usuário e a mensagem a ser enviada. 
    this.sendTextMessage = (recipientId, messageText) => {
        
        const messageData = {
            "recipient": {
                "id": recipientId
            },
            "message": {
               "text": messageText
            },
        }

        //enviando para callsendAPi
        this.callSendApi(messageData, 2500);
    };

    //opções iniciais do atendimento (menu principal)
    this.sendProducts = (recipientId) => {
        let messageData = 
        {
            "recipient":{
              "id":recipientId
            },
            "messaging_type": "response",
            "message":{
              "attachment":{
                "type":"template",
                "payload":{
                  "template_type":"generic",
                  "elements":
                  [
                    {
                      "title":"Sandália Anabela Bottero",
                      "subtitle":`💵 R$ 120,00\n💳 ou até 2x de R$ 60,00 s / juros`,
                      "image_url":"https://api-sale-facebook.herokuapp.com/product/get/image/jhines224.jpg",
                      "buttons":[
                      {
                          "type":"postback",
                          "title":"📦 Abrir Produto",
                          "payload":"<POSTBACK_PAYLOAD>"
                      },
                      {
                          "type":"postback",
                          "title":"❤ Favoritar",
                          "payload":"<POSTBACK_PAYLOAD>"
                          }
                      ]      
                  }
                  ]
                }
              }
            }
        }


        this.callSendApi(messageData, 2500);
    };

    this.menuCategory = (recipientId, data) => {
        
      let messageData = 
      {
        "recipient":{
          "id":recipientId
        },
        "messaging_type": "response",
        "message":{
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"generic",
              "elements": []
            }
          }
        }
      };

        data.forEach((category) => {

          messageData
          .message
          .attachment
          .payload
          .elements
          .push(
            {
              "title":"Categorias (➡️ ⬅️) ",
                "buttons":[
                  {
                    "type":"postback",
                    "title":`🔎 Ver ${category.name}`,
                    "payload":`category_${category.slug}`
                  }
                ]      
            });
        });

        this.callSendApi(messageData, 2500);

    };

    //////////

    this.menuHelp = (recipientId) => {
      
        let messageData = 
        {
            "recipient":{
                "id":recipientId
              },
              "message":{
                "attachment":{
                  "type":"template",
                  "payload":{
                    "template_type":"button",
                    "text":"Veja se alguma dessas opções pode lhe ajudar: 👇",
                    "buttons":[
                      {
                        "type":"postback",
                        "title":" 📗 Categorias",
                        "payload":"category"
                      },
                      {
                        "type":"postback",
                        "title":" 📕 Saiba Mais",
                        "payload":"more_information"
                      },
                      {
                        "type":"postback",
                        "title":" 📙 Dúvidas",
                        "payload":"doubt"
                      }
                    ]
                  }
                }
              }
          };

        this.callSendApi(messageData, 3000);
    };

    //enviada para dar continuidade no atendimento caso usuário queira iteragir mais.
    //enviar sempre ao final de uma ramificação.  
    this.showOptionsMenu = (recipientId) => {
        //Dá um tempo antes de retornar, para ficar mais natural. 
        setTimeout(() =>{
            this.sendTextMessage(recipientId, 'Posso te ajudar com mais alguma coisa?');
            this.statusCall[recipientId] = 'segundo_ciclo';
        }, 2500);
    }
}


module.exports = chatbotFacebook;