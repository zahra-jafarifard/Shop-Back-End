const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user')
const Roll = require('../models/roll')

module.exports = {

  signIn: async ({ email, password }, req) => {
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

  getAllRolls: () =>{
    return Roll.find()
      .then(rolls => {
        if (!rolls) {
          return new Error('Something went wrong, could not find rolls.', 404);
        }
        return rolls;
      })
      .catch(err => {
        return new Error(err , 500);
      })
  },

  updateRoll: async (args, req) => {
    const rollId = args.id;
    const name = args.name;

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

    return { message: 'Roll Updated Successfully' }
  },

  addRoll: async ({name}, req) => {
    const createdRoll = new Roll({
      name
    });

    try {
      await createdRoll.save();
    } catch (err) {
      return next(new HttpError('Something went wrong, could not create new roll.' || err, 500))
    }
    return { message: 'Roll added...' }
  },
  getRollById: async (args, req) => {
    const rollId = args.id;

    return Roll.findById(rollId)
      .then(roll => {
        if (!roll) {
          return next(new HttpError('Something went wrong, could not find roll  for this ID.', 404))
        }
        return roll;
      })
      .catch(err => {
        const error = new HttpError(err.message, 500)
        return next(error)
      });
  },
  deleteRoll: async (args, req) => {
    const rollId = args.id;

    let roll;
    try {
      roll = await Roll.findById(rollId).populate('users')

    } catch (err) {
      return next(new HttpError('Something went wrong, could not remove roll.', 500))
    }
    if (roll.users.length !== 0) {
      return next(new HttpError('You are not allowed to delete this roll.', 500))
    }
    try {
      await roll.remove();

    } catch (err) {
      return next(new HttpError('Something went wrong, could not remove roll.', 500))

    }

    return {message:'deleted...'}
  }

};
