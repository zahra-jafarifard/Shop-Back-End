const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const HttpError = require('../models/http-error');
const User = require('../models/user');


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
        image: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fi.pinimg.com%2F736x%2F5a%2Fa9%2Ff4%2F5aa9f493f2103d782a00c92fec4ab1c3.jpg&imgrefurl=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F672232681869031387%2F&tbnid=leOUh9DXpvt2SM&vet=12ahUKEwi60Z26mIz3AhUEixoKHQvsCEcQMygBegUIARDGAQ..i&docid=r22IoW7Hj0PHSM&w=728&h=824&itg=1&q=people%20mini%20cartoon&ved=2ahUKEwi60Z26mIz3AhUEixoKHQvsCEcQMygBegUIARDGAQ",
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

    const { name, family, mobile, email, password, roll } = req.body;
    let user;
    let hashedPassword;
    var objectId = mongoose.Types.ObjectId(userId);
    console.log(req.body , objectId )

    try {
        user = await User.findById(objectId)
    } catch (err) {
        console.log(err)
        return next(new HttpError(err, 500))
    }
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        console.log(err)
        return next(new HttpError("Could not hashed password ", 500))
    }
    user.name = name;
    user.family = family;
    user.mobile = mobile;
    user.email = email;
    user.password = hashedPassword;
    user.rollId = roll;
    try {
        await user.save();
    } catch (err) {
        console.log(err)

        return next(new HttpError('Could not create user, please try again.', 500))
    }
    res.status(201).json({ user: user.toObject({ getters: true }) })
};

exports.add = async (req, res, next) => {
    const { name, family, mobile, email, image, password, roll } = req.body;

    let existingUser;

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

    const createdUser = new User({
        name,
        family,
        mobile,
        email,
        image: "data:image/jpeg;base64,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",
        password: hashedPassword,
        rollId: roll
    })


    try {
        await createdUser.save();

    } catch (err) {
        return next(new HttpError(err, 500))
    }
    res.status(201).json({ users: createdUser })

};

exports.getAll = (req, res, next) => {
    return User.find().populate('rollId')
        .then(users => {
            console.log(users[0])
            res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) })
        })
        .catch(err => {
            return next(new HttpError('Something went wrong, could not find users.', 500))
        })
};

exports.get = (req, res, next) => {
    const userId = req.params.userId;
    return User.findById(userId)
        .then(user => {
            // console.log(user)
            res.status(200).json({ user: user.toObject({ getters: true }) })
        })
        .catch(err => {
            return next(new HttpError('Something went wrong, could not find user.', 500))

        })
}
exports.delete = (req, res, next) => {
    const userId = req.params.userId;
    return User.findById(userId)
        .then(user => {
            console.log(user)
            return user.remove()
        })
        .then(() => {
            res.status(200).json({ message :'User Deleted Successfully...' })
        })
        .catch(err => {
            return next(new HttpError('Something went wrong, could not find user.', 500))

        })
}