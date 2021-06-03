const {Schema, ParamSchema} = require('express-validator')

/** @type{ParamSchema} */
const passwordValidator = {
  errorMessage: 'Invalid password!',
  in: ['body'],
  isString: {
    errorMessage: 'Password must be string'
  },
  isLength: {
    errorMessage: 'Password should be at least 7 chars long',
    // Multiple options would be expressed as an array
    options: { min: 7, max: 100 },
  },
  matches: {
    errorMessage: 'Password should contain digit, lowercase, uppercase and a special character',
    //          digit   lowercase  uppercase    special_char
    options: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{3,}$/,
  }
}


/** @type{Schema} */
const setPasswordModel = {
  passwordToken: {
    in: ['body'],
    isString: true,
    errorMessage: 'Missing/bad set password token'
  },
  password: passwordValidator,
  confirmPassword: passwordValidator,
  secret2fa: {
    // in: ['body'],
    // errorMessage: 'Invalid secret2fa string',
    // isString: true,
    // isLength: {
    //   options: {min: 10}
    // }
  },
  confirm2fa: {
    // in: ['body'],
    // isString: true,
    // isLength: {
    //   errorMessage: 'Confirmation code should be of length 6',
    //   options: {min: 6, max: 6}
    // }
  }
}

/** @type{Schema} */
const createDemoUserModel = {
  username: {
    isEmail: true,
  },
  password: passwordValidator,
  requires2fa: {
    isBoolean: true
  },
  user_type: {
    optional: true,
    equals: {
      options: 'demo'
    }
  },
  phoneNumber: {
    isString: true
  },
  full_name: {
    isString: true,
  },
  job_title: {
    isString: true,
  },
  company: {
    isString: true,
  }
}


/** @type{Schema} */
const loginModel = {
  username: {
    isEmail: true,
    trim: true,
    in: ['body'],
  },
  password: {
    isString: true,
    in: ['body'],
  },
  confirm2fa: {
    in: ['body'],
    optional: true
  }
}
// body('username').trim().isString(),
//     body('password').trim().isString(),
//     body('confirm2fa')

module.exports = {
  setPasswordModel,
  createDemoUserModel,
  loginModel,
}
