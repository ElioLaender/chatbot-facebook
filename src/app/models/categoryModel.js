const mongoose = require('../../database/mongo/mongoConnection');

//Referência de implementação: https://docs.mongodb.com/ecosystem/use-cases/category-hierarchy/
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    slug: {
        type: String,
        require: true 
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        reference: 'Category'
    },
    ancestors: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        slug: String    
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
