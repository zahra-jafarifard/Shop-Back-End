const Product = require('../models/product');
const HttpError = require('../models/http-error');

exports.getAll = (req, res, next) => {

    return Product.find().exec()
        .then(products => {
            if (!products) {
                return next(new HttpError('Something went wrong, could not find products.', 404))
            }
            res.json({ products: products.map(product => product.toObject({ getters: true })) });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })

};


exports.getById = (req, res, next) => {
    const productId = req.params.productId;
    // console.log(productId)

    return Product.findById(productId)
        .then(product => {
            if (!product) {
                return next(new HttpError('Something went wrong, could not find product for this ID.', 404))
            }
            res.json({ product: product.toObject({ getters: true }) })
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        });
};


exports.delete = (req, res, next) => {
    const productId = req.params.productId;

    Product.findByIdAndDelete(productId)
        .then(() => {
            res.status(200).json({ message: 'Deleted product.' })
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};


exports.update = async (req, res, next) => {
    // const { name, price, description, images, category } = req.body;
    const { name, price } = req.body;
    const productId = req.params.productId;
    let product;
    try {
        product = await Product.findById(productId)

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update product.', 500))
    }

    product.name = name;
    product.price = price;
    // product.description = description;
    // product.images = images;
    // product.category = category;
    try {
        await product.save();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update product.', 500))

    }

    res.status(200).json(({ product: product.toObject({ getters: true }) }))
};


exports.add = async (req, res, next) => {

    // const { name, price, description, images, category } = req.body;
    const { name, price, description, images } = req.body;

    const createdProduct = new Product({
        name,
        price,
        description,
        images,
        // category
    });
    try {
        await createdProduct.save();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not create new product.', 500))

    }
    res.status(200).json({ product: createdProduct.toObject({ getters: true }) })

};


exports.getProductsByCategory = (req, res, next) => {

    const { categoryId } = req.body;

    Product.find({ category: categoryId })
        .then(products => {
            if (!products) {
                return next(new HttpError('Something went wrong, could not find products for this category.', 404))
            }
            res.status(200).json({ products: products })
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};