const mongoose = require('mongoose');


const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const HttpError = require('../models/http-error');

exports.getAll = (req, res, next) => {

    return Product.find().populate('category')
        .then(products => {
            if (!products) {
                return next(new HttpError('Something went wrong, could not find products.', 404))
            }
            res.json({ fetchData: products.map(product => product.toObject({ getters: true })) });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })

};


exports.getCategories = (req, res, next) => {
    return Category.find()
        .then(_categories => {
            if (!_categories) {
                return next(new HttpError('Something went wrong, could not find categories.', 404))
            }
            const categories= _categories.filter(category => category.parentId );
            const parents= _categories.filter(category => !category.parentId );
            let parArr=[];
            categories.forEach(cat => {
                parents.forEach(par => {
                   if(cat.parentId.toString() === par._id.toString()){
                       parArr.push({id:cat._id , name:par.name+"-->"+cat.name})
                   }
               });
            });

            res.status(200).json({ fetchData: parArr});
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};
exports.getById = (req, res, next) => {
    const productId = req.params.productId;

    return Product.findById(productId)
        .then(product => {
            if (!product) {
                return next(new HttpError('Something went wrong, could not find product for this ID.', 404))
            }
            res.json({ fetchData: product.toObject({ getters: true }) })
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        });
};


exports.delete = async (req, res, next) => {

    var productId = mongoose.Types.ObjectId(req.params.productId);

    let deletedProduct;
    let _session;
    try {
        deletedProduct = await Product.findById(productId).populate('category')
        // .populate('createdByUserId')

    } catch (err) {
        return next(new HttpError('Something went wrong, could not find product.', 500))
    }

    if (!deletedProduct) {
        return next(new HttpError('Could not find product for this id.', 404))
    }

    if (deletedProduct.createdByUserId.toString() !== '625456a9156b5221202c6a47') {
        return next(new HttpError('You are not allowed to delete this product.', 401))
    }

    _session = await mongoose.startSession();
    _session.startTransaction();
    try {
        await deletedProduct.remove({ session: _session })

    } catch (err) {
        return next(new HttpError('Could not delete this product.', 500))

    }

    // deletedProduct.createdByUserId.products.pull(deletedProduct);
    // await deletedProduct.createdByUserId.save({ session: _session })
    try {

        deletedProduct.category.products.pull(deletedProduct);
        await deletedProduct.category.save({ session: _session })
    } catch (error) {
        return next(new HttpError(error, 500))
    }
    try {
        await _session.commitTransaction();
    } catch (error) {
        return next(new HttpError(error, 500))
    }
    res.status(200).json({ message: 'Deleted product.' })
};


exports.update = async (req, res, next) => {
    const { name, price , description } = req.body;
    const productId = mongoose.Types.ObjectId(req.params.productId);
    let product;
    try {
        product = await Product.findById(productId)

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update product.', 500))
    }

    product.name = name;
    product.price = price;
    product.description = description
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
        images: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaZo3bqj5AVN8PtxLRolO8Zr-ZzcQGf7GMoA&usqp=CAU",
        category,
        createdByUserId
    })
    let user;
    try {
        user = await User.findById("6254477242a4797d06e7b652")
    } catch (err) {
        return next(new HttpError('Creating product failed, please try again.', 500));
    }

    if (!user) {
        return next(new HttpError('Could not find user for provided id.', 404));
    }

    let _category;
    try {
        _category = await Category.findById(category)
    } catch (err) {
        return next(new HttpError('Creating product failed, please try again.', 500));
    }
    if (!_category) {
        return next(new HttpError('Could not find category for provided id.', 404));
    }
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdProduct.save({ session: session });
        user.products.push(createdProduct);
        await user.save({ session: session });
        _category.products.push(createdProduct);
        await _category.save({ session: session })
        await session.commitTransaction();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not create new product.', 500))

    }
    res.status(201).json({ product: createdProduct.toObject({ getters: true }) })

};


