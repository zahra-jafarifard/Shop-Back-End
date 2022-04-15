const Category = require('../models/category');
const HttpError = require('../models/http-error');


exports.getAll = (req, res, next) => {
    return Category.find({parentId: { $ne: '0' }}).populate('parentId').
    exec() 
        .then(categories => {
            console.log(categories)
            if (!categories) {
                return next(new HttpError('Something went wrong, could not find categories.', 404))
            }
            res.status(200).json({ categories: categories.map(category => category.toObject({ getters: true })) });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};

exports.add = async (req, res, next) => {

    const { name, parentId } = req.body;

    const createdCategory = new Category({
        name,
        parentId : parentId ? parentId : 0
        });
    console.log(createdCategory)
    try {
        await createdCategory.save();
    } catch (err) {
        return next(new HttpError('Something went wrong, could not create new category.', 500))
    }
    res.status(201).json({ category: createdCategory.toObject({ getters: true }) })

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