const Roll = require('../models/roll');
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');


exports.getAll = (req, res, next) => {
    return Roll.find()
        .then(rolls => {
            if (!rolls) {
                return next(new HttpError('Something went wrong, could not find rolls.', 404))
            }
            res.status(200).json({ fetchData: rolls.map(roll => roll.toObject({ getters: true })) });
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        })
};

exports.add = async (req, res, next) => {

    const { name } = req.body;

    const createdRoll = new Roll({
        name
    });

    try {
        await createdRoll.save();
    } catch (err) {
        return next(new HttpError('Something went wrong, could not create new roll.' || err, 500))
    }
    res.status(201).json({ roll: createdRoll.toObject({ getters: true }) })

};

exports.update = async (req, res, next) => {
    const rollId = req.params.rollId;

    const { name } = req.body;

    let roll;
    try {
        roll = await Roll.findById(rollId)

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update roll.', 500))
    }

    roll.name = name;
    try {
        await roll.save();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not update roll.', 500))

    }

    res.status(200).json(({ roll: roll.toObject({ getters: true }) }))
};

exports.delete = async (req, res, next) => {
    const rollId = req.params.rollId;

    let roll;
    try {
        roll = await Roll.findById(rollId).populate('users')

    } catch (err) {
        return next(new HttpError('Something went wrong, could not remove roll.', 500))
    }
    if (roll.users.length !== 0){
        return next(new HttpError('You are not allowed to delete this roll.', 500))
    }
    try {
        await roll.remove();

    } catch (err) {
        return next(new HttpError('Something went wrong, could not remove roll.', 500))

    }

    res.status(200).json(({ message:'Roll deleted successfully...' }))
};


exports.getById = (req, res, next) => {
    const rollId = req.params.rollId;

    return Roll.findById(mongoose.Types.ObjectId(rollId))
        .then(roll => {
            if (!roll) {
                return next(new HttpError('Something went wrong, could not find roll  for this ID.', 404))
            }
            res.json({ fetchData: roll.toObject({ getters: true }) })
        })
        .catch(err => {
            const error = new HttpError(err.message, 500)
            return next(error)
        });
};


