const mongoose = require('../../database/mongo/mongoConnection');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    slugName: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    categories: String, //Ex: rasteirinha, femininos, calçados
    variations: [{
        price: {
            type: Number,
            require: true,
        },
        stock: {
            type: Number,
            require: true,
        },
        promotionalPrice: {
            price: {
                type: Number,
                require: true,
            },
            initialDate: {
                type: Date,
                require: true,
            },
            finalDate: {
                type: Date,
                require: true,
            },
        },
        productCode: {
            type: String,
            require: true,
        },
        measures: {
            waist: Number,
            hip: Number,
            length: Number,
        },
        images: [{
            path: String,
        }],
        productSize: String,
        productColor: String,
        weight: {
            type: Number,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    evaluations: [{
        stars: {
           type: Number,
           require: true,
        }, 
        evaluationDescription: {
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
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


const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;