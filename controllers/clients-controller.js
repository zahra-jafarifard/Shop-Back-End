const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs')

const HttpError = require('../models/http-error');
const Client = require('../models/clients');


exports.signUp = async (req, res, next) => {
    const { mobile, password } = req.body;
    // console.log('reeeq', req.body)

    let existingClient;
    try {
        existingClient = await Client.findOne({ mobile });
    } catch (err) {
        
        return next(new HttpError('Signing up failed, please try again later.', 500))
    }

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12)
        } catch (err) {
            return next(new HttpError('Could not create client, please try again.', 500))
        }

        const createdClient = new Client({
            mobile,
            password: hashedPassword,
        })
        // console.log(createdClient, hashedPassword)

        try {
            await createdClient.save();
        } catch (err) {
            return next(new HttpError('Signing up failed, please try again later.', 500))
        }

        let token;
        try {
            token = jwt.sign(
                { clientId: createdClient.id, mobile: createdClient.mobile },
                'mySecretKey',
                { expiresIn: '1h' }
            );

        } catch (err) {
            return next(new HttpError('Signing up failed, please try again later.', 500))
        }
        return res.status(201).json({ clientId: createdClient.id, mobile: createdClient.mobile, token: token })
    
    };




exports.signIn = async (req, res, next) => {

    const { mobile, password } = req.body;
    let existingClient;
    try {
        existingClient = await Client.findOne({ mobile });
    } catch (err) {
        return next(new HttpError('Logging in failed, please try again later.', 500))
    }

    if (!existingClient) {
        return next(new HttpError('Invalid credentials, please try to sign in.', 403))
    }

        let unhashedPassword;
        try {
            unhashedPassword = await bcrypt.compare(password, existingClient.password)
        } catch (err) {
            return next(new HttpError('Could not log you in, please try again', 500))
        }
        if (!unhashedPassword) {
            return next(new HttpError('Iinvalid password', 403))
        }
        let token;
        try {
            token = jwt.sign(
                { clientId: existingClient.id, mobile: existingClient.mobile },
                'mySecretKey',
                { expiresIn: '1h' }
            );

        } catch (err) {
            return next(new HttpError('Logging in failed, please try again later.', 500))
        }

        return res.status(200).json({ clientId: existingClient.id, mobile: existingClient.mobile, token: token })

    
};