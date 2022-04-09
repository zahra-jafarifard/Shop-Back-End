const Product = require('../models/product');


exports.getAll = (req, res, next) => {
    return Product.find().exec()
        .then(products => {
            res.json({ products: products.map(product => product.toObject({ getters: true })) });
        })
        .catch(err => {
            console.log(err)
        })

};


exports.getById = (req, res, next) => {
    const productId = req.params.productId;

    Product.findById(productId)
        .then(product => {
            res.json({ product: product.toObject({ getters: true }) })
        })
        .catch(err => {
            console.log(err)
        });
};


exports.delete = (req, res, next) => {
    const productId = req.params.productId;

    Product.findByIdAndDelete(productId)
        .then(() => {
            res.status(200).json({ message: 'Deleted product.' })
        })
        .catch(err => {
            console.log(err);
        })
};


exports.update = async (req, res, next) => {
    const { name, price, description, images, category } = req.body;
    const productId = req.params.productId;
    let product;

    product = await Product.findById(productId)

    product.name = name,
        product.price = price,
        product.description = description,
        product.images = images,
        product.category = category

    await product.save();

    res.status(200).json(({ product: product.toObject({ getters: true }) }))
};


exports.add = async (req, res, next) => {

    const { name, price, description, images, category } = req.body;

    const createdProduct = new Product({
        name,
        price,
        description,
        images,
        category
    })
    await createdProduct.save();
    res.status(200).json({ product: createdProduct })
};
exports.getProductsByCategory = (req, res, next) => {

    const { categoryId } = req.body;

    Product.find({ category: categoryId })
        .then(products => {
            res.status(200).json({ products: products })
        })
        .catch(err => {
            console.log(err)
        })
};