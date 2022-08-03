const mongoose = require('mongoose');

const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const HttpError = require('../models/http-error');

exports.getAll = (req, res, next) => {
    return Product.find()
        .populate('createdByUserId')
        .populate('category')
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
exports.getFavoriteProducts = (req, res, next) => {
    let _favorites = [];
    _favorites = req.body.favoriteProducts;

    // console.log('fff', _favorites)

    return Product.find({
        '_id': { $in: _favorites }
    },
        '_id name price  image')
        .then(products => {
            // console.log('favprods', products)
            if (!products) {
                return next(new HttpError('Something went wrong, could not find products.', 404))
            }
            res.json({ fetchData: products });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })

};
exports.getCartItems = (req, res, next) => {
    let _cartItems = [];
    _cartItems = req.body.cartItems;

    console.log('fff', _cartItems)

    return Product.find({
        '_id': { $in: _cartItems }
    },
        '_id name price  image')
        .then(products => {
            if (!products) {
                return next(new HttpError('Something went wrong, could not find products.', 404))
            }
            res.json({ fetchData: products });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })

};
exports.getChildren = (req, res, next) => {
    return Product.find()
        .populate('category')

        .then(products => {
            if (!products) {
                return next(new HttpError('Something went wrong, could not find products.', 404))
            }
            let _children = [];
            _children = products.filter(p => {
                return p.category.parentId.toString() === '625d6b9b600f4e8ee1fe7b77'
            })
            // console.log('pppppppppp', _children)
            res.json({ fetchData: _children });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })

};
exports.getMen = (req, res, next) => {
    return Product.find()
        .populate('category')

        .then(products => {
            if (!products) {
                return next(new HttpError('Something went wrong, could not find products.', 404))
            }
            let _children = [];
            _children = products.filter(p => {
                return p.category.parentId.toString() === '625d6b95600f4e8ee1fe7b73'
            })
            // console.log('pppppppppp', _children)
            res.json({ fetchData: _children });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })

};
exports.getWomen = (req, res, next) => {
    return Product.find()
        .populate('category')

        .then(products => {
            if (!products) {
                return next(new HttpError('Something went wrong, could not find products.', 404))
            }
            let _children = [];
            _children = products.filter(p => {
                return p.category.parentId.toString() === '625d6b80600f4e8ee1fe7b6f'
            })
            // console.log('pppppppppp', _children)
            res.json({ fetchData: _children });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })

};



exports.getParentCategories = (req, res, next) => {
    return Category.find()
        .then(_categories => {
            if (!_categories) {
                return next(new HttpError('Something went wrong, could not find categories.', 404))
            }
            const parents = _categories.filter(category => !category.parentId);
            // console.log('parents', parents)
            res.status(200).json({ fetchData: parents });
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
            const categories = _categories.filter(category => category.parentId);
            const parents = _categories.filter(category => !category.parentId);
            let parArr = [];
            categories.forEach(cat => {
                parents.forEach(par => {
                    if (cat.parentId.toString() === par._id.toString()) {
                        parArr.push({ id: cat._id, name: par.name + "-->" + cat.name })
                    }
                });
            });

            res.status(200).json({ fetchData: parArr });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};
exports.getById = (req, res, next) => {
    const productId = req.params.productId;

    return Product.findById(productId, '_id name image price description')
        .then(product => {
            // console.log(product)
            if (!product) {
                return next(new HttpError('Something went wrong, could not find product for this ID.', 404))
            }
            res.json({ fetchData: product })
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
            .populate('createdByUserId')

    } catch (err) {
        return next(new HttpError('Something went wrong, could not find product.', 500))
    }

    if (!deletedProduct) {
        return next(new HttpError('Could not find product for this id.', 404))
    }

    if (deletedProduct.createdByUserId._id.toString() !== req.userId) {
        return next(new HttpError('You are not allowed to delete this product.', 401))
    }

    _session = await mongoose.startSession();
    _session.startTransaction();
    try {
        await deletedProduct.remove({ session: _session })

    } catch (err) {
        return next(new HttpError('Could not delete this product.', 500))

    }

    try {
        deletedProduct.createdByUserId.products.pull(deletedProduct);
        await deletedProduct.createdByUserId.save({ session: _session })
    }
    catch (error) {
        return next(new HttpError(error, 500))
    }
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
    const { name, price, description, image } = req.body;
    const productId = mongoose.Types.ObjectId(req.params.productId);
    let product;
    try {
        product = await Product.findById(productId)

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update product.', 500))
    }

    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;

    try {
        await product.save();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update product.', 500))

    }

    res.status(200).json(({ product: product.toObject({ getters: true }) }))
};


exports.add = async (req, res, next) => {

    const { name, price, description, category, createdByUserId } = req.body;
    const createdProduct = new Product({
        name,
        price,
        description,
        image: req.file.path,
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

    let _category;
    try {
        _category = await Category.findById(category)
    } catch (err) {
        return next(new HttpError('Creating product failed, please try again.', 500));
    }
    if (!_category) {
        return next(new HttpError('Could not find category for provided id.', 404));
    }
    // console.log(createdProduct, _category)
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
        return next(new HttpError(err, 500))

    }
    res.status(201).json({ product: createdProduct.toObject({ getters: true }) })

};


