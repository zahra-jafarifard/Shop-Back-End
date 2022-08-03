const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user')

module.exports = {

  signIn: async function ({email , password}, req) {
    // const email = args.email;
    // const password = args.password;
    // console.log('graphql...',args)
    let existingUser;
    console.log('graphql...',email,password)
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
    return { userId: existingUser.id, email: existingUser.email, token: token }

  },






};
