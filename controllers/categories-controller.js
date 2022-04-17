const mongoose = require('mongoose');

const Category = require('../models/category');
const HttpError = require('../models/http-error');


exports.getAll = (req, res, next) => {
    // return Category.find({ parentId: { $ne: '0' } })
    return Category.find()
        .populate('parentId')
        .then(categories => {
            if (!categories) {
                return next(new HttpError('Something went wrong, could not find categories.', 404))
            }
            res.status(200).json({ fetchData: categories.map(category => category.toObject({ getters: true })) });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};
exports.getParents = (req, res, next) => {
    // return Category.find({ parentId: { $eq: '0' } })
    return Category.find()
        .then(_parents => {
            const parents = _parents.filter(p => !p.parentId)
            if (!_parents) {
                return next(new HttpError('Something went wrong, could not find parents.', 404))
            }
            res.status(200).json({ fetchData: parents.map(parent => parent.toObject({ getters: true })) });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};

exports.add = async (req, res, next) => {

    const { name, parent } = req.body;
    let createdCategory;
    if (req.body.parent.length !== 0) {
        createdCategory = new Category({
            name,
            parentId: parent
        });
    } else {
        createdCategory = new Category({
            name,
        });
    }

    try {
        await createdCategory.save();
    } catch (err) {
        return next(new HttpError('Something went wrong, could not create new category.', 500))
    }
    res.status(201).json({ category: createdCategory.toObject({ getters: true }) })

};


exports.getById = (req, res, next) => {
    const categoryId = req.params.categoryId;

    return Category.findById(categoryId)
        .then(category => {
            if (!category) {
                return next(new HttpError('Something went wrong, could not find category for this ID.', 404))
            }
            res.json({ fetchData: category.toObject({ getters: true }) })
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        });
};

exports.update = async (req, res, next) => {
    const categoryId = req.params.categoryId;

    const { name, parentId } = req.body;

    let category;
    try {
        category = await Category.findById(categoryId)

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update category.', 500))
    }

    category.name = name;
    category.parentId = parentId;
    try {
        await category.save();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update category.', 500))

    }

    res.status(200).json(({ category: category.toObject({ getters: true }) }))
};
exports.delete = async (req, res, next) => {
    const categoryId = mongoose.Types.ObjectId(req.params.categoryId);

    let deletedCategory;
    let _session;
    try {
        deletedCategory = await Category.findById(categoryId)
            .populate('products')
            .populate('parentId')

    } catch (err) {
        return next(new HttpError('Something went wrong, could not find category.', 500))
    }
   
    if (!deletedCategory) {
        return next(new HttpError('Could not find category for this id.', 404))
    }

    if (deletedCategory.products.length !== 0) {
        return next(new HttpError('You are not allowed to delete this category.', 401))
    }
    
    if (!deletedCategory.parentId) {
        return next(new HttpError('You are not allowed to delete this category.', 401))
    }
  
    // deletedCategory.createdByUserId.products.pull(deletedCategory);
    // await deletedCategory.createdByUserId.save({ session: _session })

    _session = await mongoose.startSession();
    _session.startTransaction();
    try {
        await deletedCategory.remove({ session: _session })

    } catch (err) {
        return next(new HttpError('Could not delete this category.', 500))

    }

    // try {

    //     deletedCategory.category.products.pull(deletedCategory);
    //     await deletedCategory.category.save({ session: _session })
    // } catch (error) {
    //     return next(new HttpError(error, 500))
    // }
    try {
        await _session.commitTransaction();
    } catch (error) {
        return next(new HttpError(error, 500))
    }
    res.status(200).json({ message: 'Deleted category.' })
};


exports.getProductsByCategory = (req, res, next) => {

    const { categoryId } = req.params.categoryId;

    Category.findById(categoryId).populate('products')
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