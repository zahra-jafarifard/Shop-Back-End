const Roll = require('../models/roll');
const HttpError = require('../models/http-error');


exports.getAll = (req, res, next) => {
    return Roll.find().exec()
        .then(rolls => {
            if (!rolls) {
                return next(new HttpError('Something went wrong, could not find rolls.', 404))
            }
            res.status(200).json({ rolls: rolls.map(roll => roll.toObject({ getters: true })) });
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
        return next(new HttpError('Something went wrong, could not create new roll.', 500))
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


