const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');


exports.signUp = async (req, res, next) => {
    const { name, family, mobile, email, password, rollId } = req.body;

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

exports.logIn = async (req, res, next) => {

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

    const { name, family, mobile, email, password, rollId } = req.body;
    let user;
    let hashedPassword;

    try {
        user = await User.findById(userId)
    } catch (err) {
        return next(new HttpError('Could not create user, please try again', 500))
    }
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError('Could not create user, please try again.', 500))
    }

    user.name = name;
    user.family = family;
    user.mobile = mobile;
    user.email = email;
    user.password = hashedPassword;
    user.rollId = rollId;
    try {
        await user.save();
    } catch (err) {
        return next(new HttpError('Could not create user, please try again.', 500))
    }
    res.status(201).json({ user: user.toObject({ getters: true }) })
};

exports.add = async (req, res, next) => {
    const { name, family, mobile, email, password, rollId } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500))
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
        password: hashedPassword,
        rollId
    })

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500))
    }
    res.status(201).json({ userId: createdUser.id, email: createdUser.email })

};

exports.getAll = (req, res, next) => {
    return User.find({}, 'name family mobile email rollId')
        .then(users => {
            res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) })
        })
        .catch(err => {
            return next(new HttpError('Something went wrong, could not find users.', 500))
        })
};

