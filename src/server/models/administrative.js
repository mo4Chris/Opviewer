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
    in: ['body'],
    errorMessage: 'Invalid secret2fa string',
    isString: true,
  },
  confirm2fa: {
    in: ['body'],
    isString: true,
    isLength: {
      errorMessage: 'Confirmation code should be of length 6',
      options: {min: 6, max: 6}
    }
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
      options: ['demo']
    }
  },
  vessel_ids: {
    optional: true,
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
    normalizeEmail: true,
    in: ['body'],
  },
  password: {
    isString: true,
    in: ['body'],
  },
  confirm2fa: {
    in: ['body'],
    optional: true,
    isLength: {
      errorMessage: 'Confirmation code should be of length 6',
      options: {min: 6, max: 6}
    }
  }
}
// body('username').trim().isString(),
//     body('password').trim().isString(),
//     body('confirm2fa')


/** @type{Schema} */
const updateUserSettingsModel = {
  unit: {
    errorMessage: 'Unit must provided as object',
    isObject: true
  },
  dpr: {
    errorMessage: 'DPR must provided as object',
    // isObject: true // Can currently be null
  },
  longterm: {
    errorMessage: 'Longterm must provided as object',
    isObject: true
  },
  weather_chart: {
    errorMessage: 'Weather chart settings must provided as object',
    isObject: true
  },
  "timezone.type": {
    isString: true,
  },
  "timezone.fixedTimeZoneOffset": {
    isNumeric: true,
  },
  "timezone.fixedTimeZoneLoc": {
    isString: true,
  },
}


/** @type{Schema} */
const updateUserPermissionsModel = {
  permission: {
    isObject: true,
  },
  userCompany: {
    isString: true,
  },
  boats: {
    isArray: true,
  }
}


module.exports = {
  setPasswordModel,
  createDemoUserModel,
  loginModel,
  updateUserSettingsModel,
  updateUserPermissionsModel,
}
