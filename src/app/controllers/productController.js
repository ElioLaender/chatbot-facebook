const express = require('express');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const authMiddleware = require('../middlewares/authMiddleware');
const Product = require('../models/productModel');

const router = express.Router();
//To register middleware for route interception
//router.use(authMiddleware);

router.get('/find/:productId?', async (req, res) => {
    
    const productId = req.params.productId;

    await Product.find({_id: productId})
    .populate({path: "variations", model: "Variation"})
    .exec()
    .then(
        docs => {
            if(docs.length != 0){
                res.status(200).json(docs); 
            } else {
                res.status(400).json({"message" : "Product Not Found"});
            }
        }
    )
    .catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });
});

router.get('/all', async (req, res, ) => {

    await Product.find()
    .exec()
    .then(
        docs => {
            if(docs.length != 0){
                res.status(200).json(docs); 
            } else {
                res.status(400).json({"message" : "Product Not Found"});
            }
        }
    )
    .catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });

});

router.post('/new', (req, res) => {

    const productData = req.body;

    //Get array of images converted to Base64
    const imagesBase64 = productData.variations.images;

    console.log("-------------");
    console.log(imagesBase64);
    
    delete productData.variations.images;

    const productVariation = productData.variations;

    //Keeps the variations field as an array. 
    productData.variations = [];

    Product.create(productData, (err, data) => {
        if(err) console.log(err);
        
            const getDate = new Date();
            let buffer, 
                increment = 1, 
                filename;

            //Array containing the path of the images on the server
            const imagesPath = [];
            let params;
            let base64Image;
            let decodedImage;

            
            for(let curDate of imagesBase64) {
                
                //Converte a imagem de base64 para binário
                buffer = new Buffer(curDate.imageBase64, "base64");

                filename = path.join(`product_image_${getDate.getMilliseconds() + (increment++)}.jpg`);
                
                mkdirp('public/images/', function (err) {
                    if (err) console.log(err);
                    
                    fs.writeFile(`public/images/${filename}`, buffer, 'binary', function(err){
                        if (err) console.log(err);


                        console.log('File saved.')
                    })

                });

                //Adiciona o caminho da imagem inserida a cada iteração.
                imagesPath.push({"path": `https://liviapsique.com.br/images/${filename}`});

            }
            productVariation.images = imagesPath;
            //Cria a variação do produto, que será vinculado ao mesmo. 
            Product.findById({'_id': data._id}, (err, user) => {
                if(err) console.log(err);
        
                user.variations.push(productVariation);
        
                user.save(function (err) {
                    if (err) return handleError(err);
                });
            
            });

    });

    return res.status(200).send({"success":"product inserted"});

});

//Get image
router.get('/get/image/:image', (req, res) => {

});

router.post('/variable/new/:productId', async (req, res) => {

    //Necessário verificar se o productId
    const productId = req.params.productId;
    const variationData = req.body;

    Product.findById({'_id': productId}, (err, user) => {
        if(err){
            console.log(err);
        } else {

            if(user != null){

                user.variations.push(variationData);
                user.save(function (err) {
                    if (err) return handleError(err);
                });
                res.status(200).send({"success":"variation inserted"});

            } else {
                res.status(400).json({"message" : "Product Not Found"});
            }
        }

    }).catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });

});

router.put('/update/:productId', async (req, res) => {
    
    const productId = req.params.productId;
    const productData = req.body;

    Product.findById({'_id': productId}, (err, data) => {
        if(err){
            console.log(err);
        } else {

            if(data != null){

                data.name = productData.name;
                data.slugName = productData.slugName;
                data.description = productData.description;

                data.save(function (err) {
                    if (err) return handleError(err);
                });
                res.status(200).send({"success":"update ok"});

            } else {
                res.status(400).json({"message" : "Product Not Found"});
            }
        }

    }).catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });

});

router.put('/variable/update/:productId/:variableId', async (req, res) => {
        
    const productId = req.params.productId;
    const variableId = req.params.variableId;
    const productData = req.body;

    Product.find({"_id":productId}, (err, data) => {
        if(err)
          console.log(err);
        
        if(data != null){

          if(data[0].variations.id(variableId) == null)
            return res.status(404).json({"message" : "Variation Not Found"});
                  
          data[0].variations.id(variableId).productCode = productData.productCode;
          data[0].variations.id(variableId).measures = {
              waist: productData.waist, 
              hip: productData.hip, 
              length: productData.length
          };
          data[0].variations.id(variableId).weight = productData.weight;
          data[0].variations.id(variableId).stock = productData.stock;
          data[0].variations.id(variableId).price = productData.price;
          data[0].variations.id(variableId).productSize = productData.productSize;
          data[0].variations.id(variableId).productColor = productData.productColor;
          data[0].variations.id(variableId).categories = productData.categories;

          data[0].save(function (err) {
            if (err) return handleError(err);
          });
        
          res.status(200).send({"success":"update ok"});  

          //res.send(variation); 
          
        } else {
          res.status(404).json({"message" : "Product Not Found"});
        }

    }).catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });

    //return res.send('Update');
});

router.delete('/:productId', async (req, res) => {
   
    Product.deleteOne(req.body.productId, (err) => {
        if(err)
          handleError(err);

          res.status(200).send({"success":"Product deleted"});

    }).catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });

});

//variation delete
router.delete('/variation/:productId/:variableId', async (req, res) => {
   
    const productId = req.params.productId;
    const variableId = req.params.variableId;
    
    Product.find({"_id":productId}, (err, data) => {
        if(err)
          console.log(err);
    
        if(data != null){
          if(data[0].variations.id(variableId) == null)
            return res.status(404).json({"message" : "Variation Not Found"});
          
          data[0].variations.id(variableId).remove();
          data[0].save(function (err) {
            if (err) return handleError(err);
          });  

          res.status(200).send({"success":"variation deleted"});  
        } else {
          res.status(404).json({"message" : "Product Not Found"});
        }
    }).catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });

});

//Delete and Update Images
router.post('/variation/images/:productId/:variableId', async (req, res) => {
    res.send('insert image');
});
router.delete('/variation/images/:productId/:variableId', async (req, res) => {
    res.send('delete image');
});


router.delete('/hello', async (req, res) => {
    res.send('Hello!! I');
});
module.exports = app => app.use('/product', router);

