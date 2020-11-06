const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your Name']
  },
  email: {
    type: String,
    required: [true, 'Please provide us with your Mail'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a Valid Email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a Password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your Password'],
    validate: {
      // This validator will only work on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function (next) {
  // Only Run this function if Password was actually Modified
  if (!this.isModified('password'))
    return next();

  // Hash the Password with cost of 12, where COST basically determines the CPU intensity of the Operation
  this.password = await bcrypt.hash(this.password, 12);

  // Making sure that the confirm password field is not persisted in the Database
  this.passwordConfirm = undefined;

  // Call the next function in the Middleware Stack
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // THIS points to the Current Query
  this.find({ active: { $ne: false } });
  next();
});

// This is how we define an Instance method, i.e. it will be available on all the Documents defined using this Schema. And we define this method here instead of defining it in the controller function, because it is more about the actual Data. Also, we need to pass the userPassword because we have made the SELECT property on the Password as false, so we doesn't get the password back with the data. Had it been otherwise, we could have used THIS.PASSWORD to access the Password.
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    // If this returns TRUE, then it means that the USER changed the Password, after the TOKEN was issued. 
    return JWTTimestamp < changedTimestamp;
  }

  // FALSE means NOT CHANGED
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log({ resetToken }, this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;