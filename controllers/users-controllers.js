const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require ('fs')

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Roll = require('../models/roll');


exports.signUp = async (req, res, next) => {
    const { name, family, mobile, email, password } = req.body;

    const rollId ='625c3fdd2cdb899849246d96';
    // const imageFile = req.file;

    const maybeFile = req.file
    const imageFile = maybeFile ? maybeFile.path : undefined
    let existingUser;
    console.log(req.body , imageFile)
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
        image: imageFile.path,
        password: hashedPassword,
        rollId
    })
    console.log(req.createdUser, hashedPassword)

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500))
    }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'mySecretKey',
            { expiresIn: '1h' }
        );
        console.log(token)

    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500))
    }
    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token })

};



exports.add = async (req, res, next) => {
    const { name, family, mobile, email, password, roll } = req.body;
    _rollId = await mongoose.Types.ObjectId(roll);
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

    const createdUser = new User({
        name,
        family,
        mobile,
        email,
        image: req.file.path,
        password: hashedPassword,
        rollId: _rollId
    })

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
    console.log(userId)
    let user;
    let pathImg;
    return User.findById(userId)
        .then(user => {
            console.log(user , user.image)
             pathImg = user.image 
            if (!user){
                return next(new HttpError('There is no user for deleting.', 500))
            }
            return user.remove()
        })
        .then(() => {
            fs.unlink(pathImg, () =>{
                console.log('file deleted from backend...')
            })
            res.status(200).json({ fetchData: 'User Deleted Successfully...' })
        })
        .catch(err => {
            return next(new HttpError(err, 500))

        })

}


exports.signIn = async (req, res, next) => {

    const { email, password } = req.body;
    let existingUser;
    console.log(req.body)
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
         unhashedPassword = await bcrypt.compare(password, existingUser.password)
    } catch (err) {
        return next(new HttpError('Could not log you in, please try again', 500))
    }
    console.log( 'unhashedPassword',unhashedPassword)
    if (!unhashedPassword) {
        return next(new HttpError('Iinvalid password', 403))
    }
    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'mySecretKey',
            { expiresIn: '1h' }
        );

    } catch (err) {
        return next(new HttpError('Logging in failed, please try again later.', 500))
    }

    res.status(200).json({ userId: existingUser.id, email: existingUser.email, token: token })


};

exports.update = async (req, res, next) => {

    const userId = req.params.userId;

    const { name, family, mobile, email, password, roll, image } = req.body;

    console.log('reeeeq', req.body)

    let user;
    let hashedPassword;

    var objectId = mongoose.Types.ObjectId(userId);



    try {
        user = await User.findById(objectId)
    } catch (err) {
        return next(new HttpError(err, 500))
    }
    try {
        hashedPassword = password ? await bcrypt.hash(password, 12) : password  ;
    } catch (err) {
        return next(new HttpError(err, 500))
    }
    
    user.name = name;
    user.family = family;
    user.mobile = mobile;
    user.email = email;
    // user.password = hashedPassword;
    user.rollId = roll;
    user.image = image;
    try {
        await user.save();
    } catch (err) {
        return next(new HttpError('Could not create user, please try again.', 500))
    }
    res.status(201).json({ user: user.toObject({ getters: true }) })
};