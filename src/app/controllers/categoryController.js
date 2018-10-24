const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const Category = require('../models/categoryModel');

const router = express.Router();
//To register middleware for route interception
//router.use(authMiddleware);

router.get('/', async (req, res) => {
    return res.send('Get category');
});

router.post('/', async (req, res) => {
    
    const categoryData = req.body;

    await Category.create(categoryData, (err, data) => {
        if(err)
          res.status(500).json({"message" : "Ops! Internal Server Error"});
        
        res.status(200).send({"success":"category inserted"}); 
    });

});

router.post('/subcategory/:parentId', async (req, res) => {
    
    const categoryData = req.body;

    Category.find({"_id":req.params.parentId}, (err, category) => {
        if(err)
            console.log(err);

        categoryData.parent = category[0]._id;
        categoryData.ancestors.push({
            "_id": category[0]._id,
            "slug": category[0].slug,
            "name": category[0].name
        });

        //verifica se existe ancestrais, caso existir, já adiciona no da filha, além de pai, também irá entrar nos ancestrais.
        category[0].ancestors.forEach((atual) => {
            if(atual._id != undefined) {
                categoryData.ancestors.push({
                    "_id": atual._id,
                    "slug": atual.slug,
                    "name": atual.name
                });    
            }    
        });

        Category.create(categoryData, (err, data) => {
            if(err)
                res.status(500).json({"message" : "Ops! Internal Server Error"});
            
            res.status(200).send({"success":"Subcategory category inserted"}); 
        });
        
    });

});

router.put('/:categoryId', async (req, res) => {
    Category.find({"_id":req.params.categoryId}, (err, category) => {
        if(err)
          console.log(err);

        category[0].name = req.body.name;
        category[0].save(function (err) {
            if (err) 
              return handleError(err);
            res.status(200).send({"success":"Category updated"});
        });
    }).catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });
});

router.delete('/:categoryId', async (req, res) => {

    await Category.deleteOne({"_id":req.params.categoryId}, (err) => {
        if(err) return console.log('ERROR: ', err);

        return res.status(200).send({"success":"Category deleted"});

    }).catch(function(e) {
        res.status(500).json({"message" : "Ops! Internal Server Error"});
    });

});

module.exports = app => app.use('/category', router);