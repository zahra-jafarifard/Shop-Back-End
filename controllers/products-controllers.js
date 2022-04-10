const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const { default: mongoose } = require('mongoose');
const product = require('../models/product');

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

    let deletedProduct;
    let sess;
    
    Product.findById(productId)
        .populate('createdByUserId')
        .populate('category')
        .then(deletedProduct => {
            if (!deletedProduct) {
                return next(new HttpError('Could not find product for this id.', 404))
            }
            if (deletedProduct.createdByUserId !== req.userData.userId) {
                return next(new HttpError('You are not allowed to delete this product.', 401))
            }
            return mongoose.startSession();
        })
        .then((sess) => {
            sess.startTransaction();
            return deletedProduct.remove({ session: sess })
        })
        .then(() => {
            deletedProduct.createdByUserId.products.pull(deletedProduct);
            return deletedProduct.createdByUserId.save({ session: sess })

        })
        .then(() => {
            deletedProduct.category.products.pull(deletedProduct);
            return deletedProduct.category.save({ session: sess })
        })
        .then(() => {
            return sess.commitTransaction();
        })
        .then(() => {
            res.status(200).json({ message: 'Deleted product.' })
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};


exports.update = async (req, res, next) => {
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
    try {
        await product.save();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update product.', 500))

    }

    res.status(200).json(({ product: product.toObject({ getters: true }) }))
};


exports.add = async (req, res, next) => {

    const { name, price, description, images, category, createdByUserId } = req.body;

    const createdProduct = new Product({
        name,
        price,
        description,
        images,
        category,
        createdByUserId
    })
    let user;
    try {
        user = await User.findById(createdByUserId)
    } catch (err) {
        return next(new HttpError('Creating product failed, please try again.', 500));
    }

    if (!user) {
        return next(new HttpError('Could not find user for provided id.', 404));
    }

    let cat;
    try {
        cat = await Category.findById(category)
    } catch (err) {
        return next(new HttpError('Creating product failed, please try again.', 500));
    }
    if (!cat) {
        return next(new HttpError('Could not find category for provided id.', 404));
    }
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdProduct.save({ session: session });
        user.products.push(createdProduct);
        await user.save({ session: session });
        cat.products.push(createdProduct);
        await cat.save({ session: session })
        await session.commitTransaction();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not create new product.', 500))

    }
    res.status(201).json({ product: createdProduct.toObject({ getters: true }) })

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