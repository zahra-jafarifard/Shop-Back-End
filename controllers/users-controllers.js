const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const HttpError = require('../models/http-error');
const User = require('../models/user');
const Roll = require('../models/roll');


exports.signUp = async (req, res, next) => {
    const { name, family, mobile, email, image, password, rollId } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500))
    }

    if (existingUser) {
        return next(new HttpError('User exists already, please login instead.', 422))
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        return next(new HttpError('Could not create user, please try again.', 500))
    }

    const createdUser = new User({
        name,
        family,
        mobile,
        email,
        image: req.file.path,
        password: hashedPassword,
        rollId
    })

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500))
    }

    let token;
    try {
        token = await jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'super secret!!!',
            { expiresIn: '1h' }
        );

    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500))
    }
    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token })

};

exports.signIn = async (req, res, next) => {

    const { email, password } = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return next(new HttpError('Logging in failed, please try again later.', 500))
    }

    if (!existingUser) {
        return next(new HttpError('Invalid credentials, please try to sign in.', 403))
    }

    let unhashedPassword;
    try {
        unhashedPassword = await bcrypt.compare(password, existingUser.hashedPassword)
    } catch (err) {
        return next(new HttpError('Could not log you in, please try again', 500))
    }

    if (!unhashedPassword) {
        return next(new HttpError('Iinvalid password', 403))
    }

    let token;
    try {
        token = await jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'super secret!!!',
            { expiresIn: '1h' }
        );

    } catch (err) {
        return next(new HttpError('Logging in failed, please try again later.', 500))
    }
    res.status(200).json({ userId: createdUser.id, email: createdUser.email, token: token })


};

exports.update = async (req, res, next) => {

    const userId = req.params.userId;

    const { name, family, mobile, email, password, roll ,image } = req.body;

    console.log('reeeeq', req.body, req.file)

    let user;
    let hashedPassword;

    var objectId = mongoose.Types.ObjectId(userId);

    // if (!req.file) {
    //     return next(new HttpError("no file in req.file...", 422));
    // }

    try {
        user = await User.findById(objectId)
    } catch (err) {
        return next(new HttpError(err, 500))
    }
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError("Could not hashed password ", 500))
    }
    user.name = name;
    user.family = family;
    user.mobile = mobile;
    user.email = email;
    user.password = hashedPassword;
    user.rollId = roll;
    user.image = image;
    try {
        await user.save();
    } catch (err) {
        return next(new HttpError('Could not create user, please try again.', 500))
    }
    res.status(201).json({ user: user.toObject({ getters: true }) })
};

exports.add = async (req, res, next) => {
    const { name, family, mobile, email, password, roll } = req.body;
    _rollId = await mongoose.Types.ObjectId(roll);
    console.log('reeeeee',req.body, req.file)
    let existingUser;
    let _session;
    let existingRoll;
    if (!req.file) {
        return next(new HttpError("no file in req.file...", 422));
    }
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return next(new HttpError('Could not fetch user.', 500))
    }

    if (existingUser) {
        return next(new HttpError('User exists already.', 422))
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        return next(new HttpError('Could not create user, please try again.', 500))
    }

    try {
        existingRoll = await Roll.findById(_rollId)
    } catch (err) {
        return next(new HttpError('Creating user failed, please try again.', 500));
    }

    console.log('existingRoll', existingRoll)

    const createdUser = new User({
        name,
        family,
        mobile,
        email,
        image: req.file.path,
        password: hashedPassword,
        rollId: _rollId
    })
    console.log('createdUser', createdUser)
    
     _session = await mongoose.startSession();
    _session.startTransaction();

    try {
        await createdUser.save({ session: _session })
        await existingRoll.users.push(createdUser);
        await existingRoll.save({ session: _session });
        await _session.commitTransaction();
    }
    catch (err) {
        return next(new HttpError(err, 500))
    }

     res.status(201).json({ users: createdUser })

};

exports.getAll = (req, res, next) => {
    const page = req.params.page
    const per_page = req.params.per_page
    return User.find().countDocuments()
        .then(count => {
            totalItem = count;
            return User.find()
                // .skip(per_page * (page - 1))
                // .limit(per_page)
                .populate('rollId')
                .then(users => {
                    res.status(200).json({ fetchData: users.map(user => user.toObject({ getters: true })), total: totalItem })
                })
        })

        .catch(err => {
            // console.log(err)
            return next(new HttpError(err, 500))
        })
};

exports.get = (req, res, next) => {
    const userId = req.params.userId;
    return User.findById(userId)
        .then(user => {
            res.status(200).json({ fetchData: user.toObject({ getters: true }) })
        })
        .catch(err => {
            return next(new HttpError('Something went wrong, could not find user.', 500))

        })
}
exports.delete = (req, res, next) => {
    const userId = req.params.userId;
    return User.findById(userId)
        .then(user => {
            return user.remove()
        })
        .then(() => {
            res.status(200).json({ message: 'User Deleted Successfully...' })
        })
        .catch(err => {
            return next(new HttpError('Something went wrong, could not find user.', 500))

        })
}