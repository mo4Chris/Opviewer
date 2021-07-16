const {Schema, ParamSchema} = require('express-validator')

const USER_TYPE_OPTIONS = ['demo', 'Vessel master', 'Logistic specialist', 'Marine controller', 'admin',
  'Client representative', 'Qhse specialist']


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
    optional: true,
    in: ['body'],
    errorMessage: 'Invalid secret2fa string',
    isString: true,
  },
  confirm2fa: {
    optional: true,
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
    isString: true,
  },
  password: passwordValidator,
  requires2fa: {
    isBoolean: true
  },
  user_type: {
    equals: {
      options: 'demo'
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
const createUserModel = {
  username: {
    isString: true,
    isLength: {
      options: {
        min: 5
      }
    }
  },
  requires2fa: {
    isBoolean: true
  },
  user_type: {
    optional: true,
    custom: {
      options: (value) => {
        return USER_TYPE_OPTIONS.includes(value)
      },
    }
  },
  vessel_ids: {
    optional: true,
    custom: {
      options: (vessels) => {
        const is_null = vessels == null;
        const is_int_array = Array.isArray(vessels) && !vessels.some(v => typeof(v) != 'number');
        return is_null || is_int_array;
      }
    }
  },
  client_id: {
    isNumeric: true
  }
}


/** @type{Schema} */
const loginModel = {
  username: {
    isString: true,
    trim: true,
    normalizeEmail: true,
    in: ['body'],
  },
  password: {
    isString: true,
    in: ['body'],
    isLength: {
      options: {
        min: 6
      }
    }
  },
  confirm2fa: {
    in: ['body'],
    optional: true,
    errorMessage: 'Confirm 2fa message should be of length 6',
    custom: {
      options: (value) => {
        const is_null = value == null || value == '';
        const is_valid = typeof(value) == 'string' && value.length == 6;
        return is_null || is_valid;
      }
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
  username: {
    isString: true,
  }
}


module.exports = {
  USER_TYPE_OPTIONS,
  setPasswordModel,
  createUserModel,
  createDemoUserModel,
  loginModel,
  updateUserSettingsModel,
  updateUserPermissionsModel,
}
