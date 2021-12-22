const { body, validationResult, checkSchema } = require("express-validator");
const { Pool } = require("pg");
const models = require('./models/administrative.js');
const user_helper = require('./helper/user')
const connections = require('./helper/connections')
const env = require('./helper/env')
const TokenModel = require("./models/token.d");
const { sortByStringField } = require("./helper/sort.js");

/**
 * Server file with all the secure endpoints to the admin database.
 *
 * @param {import("express").Application} app Main application
 * @param {import("pino").Logger} logger Logger class
 * @param {(subject: string, body: string, recipient: string) => void} mailTo
 * @api public
 */
module.exports = function (
  app,
  logger,
  mailTo = (subject, body, recipient='webmaster@mo4.online') => {}
) {

  // ############## ENDPOINTS ############

  app.get('/api/getClients', (req, res) => {
    const token = req['token'];
    const perm = token['permission'];
    if (!perm.admin) return res.onUnauthorized();
    // defaultPgLoader('clientList')(req, res);
    const query = `SELECT * FROM "clientTable"`
    connections.admin.query(query).then(sqlresponse => {
      res.send(sqlresponse.rows);
    }).catch(err => res.onError(err));
  });

  app.get('/api/vesselList', (req, res) => {
    const token = req['token'];
    const is_admin = token?.permission?.admin ?? false;
    let query, values;
    if (is_admin) {
      query = `SELECT *
        FROM "vesselTable"`
      values = [];
    } else {
      query = `SELECT *
      FROM "vesselTable"
      WHERE $1=ANY("client_ids")`
      values = [token.client_id];
    }
    connections.admin.query(query, values).then(sqlresponse => {
      const vessels = sqlresponse.rows
      const sorted = sortByStringField(vessels, v => v.nicename);
      return res.send(sorted)
    }).catch(err => res.onError(err));
  });

  app.get('/api/userPermissions', (req, res) => {
    const token = req['token'];
    const user_id = token['user_id'];
    return user_helper.loadUserPermissions(user_id).catch((err) => {
      return res.onError(err)
    })
  })

  app.post('/api/createUser', checkSchema(models.createUserModel), async (req, res) => {
    // Existing user creates a new user
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.onBadRequest(errors);

    const own_token = req['token'];
    const own_user_id = +own_token.userID;
    const own_vessel_ids = own_token.userBoats;
    const own_client_id = +own_token.client_id;
    const own_permissions = own_token.permission;
    const username = req.body.username;
    const requires2fa = req.body.requires2fa;
    const client_id = req.body.client_id;
    const vessel_ids = req.body.vessel_ids;
    const user_type = req.body.user_type;
    const is_admin = own_permissions.admin ?? false;

    // Check if user authorized to create users
    if (!is_admin && !own_permissions.user_manage) return res.onUnauthorized('User not authorized to create new users')
    if (!is_admin && user_type=='admin') return res.onUnauthorized('Only admins are authorized to create new admin accounts!')
    if (!is_admin && user_type=='demo') return res.onUnauthorized('Only admins are authorized to create new demo accounts!')
    if (!(own_user_id>0)) return res.onError('Invalid user ID!')

    logger.debug('Verifying client')
    // TODO: If a user is associated with multiple clients this wont do
    if (!is_admin && (client_id != own_client_id)) return res.onUnauthorized('Target client does not match own client')
    logger.trace({msg: 'Verfying vessels belong to client', own: own_vessel_ids, new: vessel_ids})
    if (is_admin || (own_permissions.user_see_all_vessels_client && user_type == 'Logistics specialist')) {
      // Valid - do nothing
    } else if (own_permissions.user_see_all_vessels_client) {
      logger.debug('Own vessels are null => getting vessels from helper')
      try {
        const own_vessel_list = await user_helper.getVesselsForUser(own_token)
        const own_vessel_ids = own_vessel_list.map(v => v.vessel_id);
        if (vessel_ids.some(_vessel_id => {
          return !own_vessel_ids.some(_id => _vessel_id == _id)
        })) return res.onUnauthorized();
      } catch (err) {
        return res.onError(err);
      }
    } else {
      if (vessel_ids == null) return res.onUnauthorized('Cannot assign vessels you have no access to!')
      const illegal = vessel_ids.some(id => {
        const in_own_vessel_list = own_vessel_ids.some(_onw_id => id === _onw_id)
        return !in_own_vessel_list;
      });
      if (illegal) return res.onUnauthorized('Cannot assign vessels you have no access to!')
    }

    // This part is now solved in an await statement to reduce its complexity
    let password_setup_token = '';
    try {
      password_setup_token = await user_helper.createUser({
        username,
        requires2fa,
        client_id,
        vessel_ids,
        user_type
      })
    } catch (err) {
      if (err.constraint == 'Unique usernames') return res.onUnauthorized('User already exists')
      return res.onError(err, 'Error creating user')
    }
    logger.info(`Successfully created new user with random token ${password_setup_token}`)
    // send email
    const SERVER_ADDRESS = env.SERVER_ADDRESS;
    const link = `${SERVER_ADDRESS}/set-password;token=${password_setup_token};user=${username}`;
    const html = 'An account for the dataviewer has been created for this email. To activate your account <a href="' + link + '">click here</a> <br>' +
      'If that does not work copy the link below <br>' + link;
    mailTo('Registered user', html, username);
    logger.info({msg: 'Succesfully created user ', username, created_by: own_user_id})
    return res.send({ data: `User ${username} succesfully added!` });
  });

  app.post("/api/resetPassword",
    body('username').isString().trim(),
    async function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      const token = req['token']
      const requesting_user = token.username;
      const username = req.body.username;
      const localLogger = logger.child({
        requested_by: requesting_user,
        req_user_type: token.permission.user_type,
        username
      })
      localLogger.info(`Password reset requested`)
      user_helper.getPermissionToManageUser(token, username).catch(err => {
        if (err.message == 'User not found') return res.status(400).send('User not found');
        return res.onError(err)
      }).then((has_rights) => {
        localLogger.debug('Valid permission = ' + has_rights)
        if (!has_rights) return res.onUnauthorized();
        const randomToken = user_helper.generateRandomToken();
        const SERVER_ADDRESS = env.SERVER_ADDRESS

        const query = `UPDATE "userTable"
          SET "token"=$1,
            "password"=null
          WHERE "username"=$2`
        const values = [randomToken, username]
        localLogger.debug('Executing database insert')
        connections.admin.query(query, values).then(() => {
          localLogger.debug('Insert successfull - sending email')
          const link = SERVER_ADDRESS + "/set-password;token=" + randomToken + ";user=" + username;
          let html = `Your password has been reset. To use your account again, please
            <a href="${link}">click here</a> <br>
            If that doesnt work copy the link below <br> ${link}`;
            mailTo('Password reset', html, username);
            res.send({ data: "Succesfully reset the password" });
        }).catch(err => res.onError(err));
      })
    }
  );

  app.post("/api/saveUserVessels",
    body('username').isString().normalizeEmail(),
    body('vessel_ids').isArray(),
    function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      const username = req.body.username;
      const vessel_ids = req.body.vessel_ids;
      const token = req['token'];

      user_helper.getPermissionToManageUser(token, username).catch(err => {
        if (err.message == 'User not found') return res.status(400).send('User not found');
        return res.onError(err)
      }).then((has_rights) => {
        if (!has_rights) return res.onUnauthorized()
        const query = `UPDATE "userTable"
            SET "vessel_ids"=$1
            WHERE "username"=$2`;

        const values = [vessel_ids, username];
        connections.admin.query(query, values).then((sql_response) => {
          if (sql_response.rowCount > 0) return res.send({ data: "Succesfully saved the vessels"});
          res.onError(`Failed to update vessels for user ${username}`, 'Failed to save new vessel list')
        }).catch(err => res.onError(err));
      })
    }
  );

  app.post("/api/setUserActive",
    body('username').isString().trim(),
    function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      const token = req['token']
      const permission = token['permission'];
      const is_admin = permission.admin
      if (!is_admin && !permission.user_manage) return res.onUnauthorized('User not authorized to manage users');

      const username = req.body.username;
      let query, values;
      if (is_admin) {
        query = `UPDATE "userTable"
          SET "active"=true
          WHERE "userTable"."username"=$1`
        values = [username];
      } else {
        query = `UPDATE "userTable"
          SET "active"=true
          WHERE "userTable"."username"=$1 AND client_id=$2`
        values = [username, token['client_id']];
      }
      connections.admin.query(query, values).then(sqldata => {
        logger.info({
          msg: 'User (re)-activated',
          manager_user_id: token['userID'],
          username: username
        })
        res.send({ data: "Succesfully activated user" });
      }).catch(err => res.onError(err))
    }
  );

  app.post("/api/setUserInactive",
    body('username').isString().trim(),
    function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      const token = req['token']
      const permission = token['permission'];
      const is_admin = permission.admin
      if (!is_admin && !permission.user_manage) return res.onUnauthorized();

      const username = req.body.username;
      let query, values;
      if (is_admin) {
        query = `UPDATE "userTable"
          SET "active"=false
          WHERE "username"=$1`
        values = [username];
      } else {
        query = `UPDATE "userTable"
          SET "active"=false
          WHERE "username"=$1 AND "client_id"=$2`
        values = [username, token['client_id']];
      }
      connections.admin.query(query, values).then(sqldata => {
        logger.info({
          msg: 'User deactivated',
          manager_user_id: token['userID'],
          username: username
        })
        res.send({ data: "Succesfully deactivated this user" });
      }).catch(err => res.onError(err))
    }
  );

  app.post("/api/sendFeedback",
    body("message").isString(),
    body("page").isString(),
    function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      const token = req['token'];
      const user = token['username'];
      const feedback = req.body.message;
      const client = token['userCompany']
      const page = req.body.page;
      logger.info({
        msg: 'Received feedback',
        client: client,
        user: user,
        feedback: feedback,
        page: page
      })
      const html = `Feedback has been given by: ${user} on page ${page}.<br><br>
        Feedback message: ${feedback}`;
      const WEBMASTER_MAIL = env.WEBMASTER_MAIL;
      mailTo('Feedback ' + client, html, WEBMASTER_MAIL);
      res.send({ data: 'Feedback has been sent', status: 200 });
    }
  );

  app.get("/api/requestFullAccount", function(req, res) {
    const token = req['token'];
    const user = token['username'];
    logger.info({
      msg: 'Full account requested',
      user: user,
    })
    const html = `A full account has been requested by demo user: ${user} <br><br>
      Please contact this user to help set up a full account.`;
    const WEBMASTER_MAIL = env.WEBMASTER_MAIL;
    mailTo('Full account request', html, WEBMASTER_MAIL);
    res.send({ data: 'Full account has been requested', status: 200 });
  });

  app.get('/api/loadUserSettings', function(req, res) {
    const token = req['token']
    const user_id = token['userID']
    const query = `SELECT * FROM "userSettingsTable" WHERE "user_id"=$1`
    const values = [user_id];
    connections.admin.query(query, values).then(sqldata => {
      res.send(sqldata.rows[0])
    }).catch(err => res.onError(err))
  });

  app.post('/api/saveUserSettings',
    checkSchema(models.updateUserSettingsModel),
    function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      const token = req['token']
      let newSettings = req.body;
      const user_id = token['userID'];
      const query = `INSERT INTO "userSettingsTable"("user_id", "unit", "dpr", "longterm", "weather_chart", "timezone")
        VALUES($1, $2, $3, $4, $5, $6)
        ON CONFLICT ("user_id")
          DO UPDATE
            SET unit=$2,
            dpr=$3,
            longterm=$4,
            weather_chart=$5,
            timezone=$6
          WHERE "userSettingsTable"."user_id"=$1`
      const values = [
        user_id,
        newSettings['unit'],
        newSettings['dpr'],
        newSettings['longterm'],
        newSettings['weather_chart'],
        newSettings['timezone'],
      ];
      connections.admin.query(query, values).then(sqldata => {
        res.send({status: 1});
      }).catch(err => res.onError(err))
    }
  );

  app.get("/api/checkUserActive/:user", function(req, res) {
    // Function is currently used to check status of userID in Token
    // Function is deprecated. Has to be removed. Has been resolved by middleware in server.js
    res.send(true);
  });

  app.get("/api/getUsers", function(req, res) {
    /** @type {TokenModel} */
    const token = req['token'];
    const permission = token.permission;
    const is_admin = token?.permission?.admin ?? false;
    const client_id = token?.client_id;
    if (!is_admin && !permission.user_read) return res.onUnauthorized()

    const selectedFields = `"userTable"."user_id", "userTable"."active", "username", "vessel_ids", "userTable"."client_id",
    "admin", "user_read", "demo", "user_manage", "twa", "dpr", "longterm",
    "user_type", "forecast", "client_name"`
    let query, value;
    if (is_admin) {
      query = `SELECT ${selectedFields}
        FROM "userTable"
        LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
        LEFT JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"`;
      value = []
    } else {
      query = `SELECT ${selectedFields}
        FROM "userTable"
        LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
        LEFT JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
        WHERE "clientTable"."client_id"=$1`;
      value = [client_id]
    }
    connections.admin.query(query, value).then(async sqldata => {
      const users = [];
      for (let _row = 0; _row<sqldata.rowCount; _row++) {
        const row = sqldata.rows[_row];
        users.push({
          active: row.active,
          userID: row.user_id,
          username: row.username,
          client_name: row.client_name,
          client_id: row.client_id,
          vessel_ids: row.vessel_ids,
          permission: {
            user_type: row.user_type,
            admin: row.admin,
            user_read: row.user_read,
            demo: row.demo,
            user_manage: row.user_manage,
            twa: row.twa,
            dpr: row.dpr,
            longterm: row.longterm,
            forecast: row.forecast,
          },
          // boats: vessels
        });
      }
      const sorted = sortByStringField(users, u => u.username);
      return res.send(sorted)
    }).catch(err => {
      return res.onError(err)
    })
  });

  app.post("/api/getUserByUsername", body('username').isString(), function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.onBadRequest(errors);

    const token = req['token'];
    const permission = token.permission;
    const is_admin = token?.permission?.admin ?? false;
    const client_id = token.client_id;
    const username    = req.body.username;

    if (!is_admin && !permission.user_read) return res.onUnauthorized()

    const selectedFields = `"userTable"."user_id", "userTable"."active", "username", "vessel_ids", "userTable"."client_id",
    "admin", "user_read", "demo", "user_manage", "twa", "dpr", "longterm",
    "user_type", "forecast", "client_name"`
    let query, value;
    if (is_admin) {
      query = `SELECT ${selectedFields}
        FROM "userTable"
        LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
        LEFT JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
        WHERE "userTable"."username" = $1`;
      value = [username]
    } else {
      query = `SELECT ${selectedFields}
        FROM "userTable"
        LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
        LEFT JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
        where "username"=$1 AND "userTable"."client_id"=$2`;
      value = [username, client_id]
    }
    connections.admin.query(query, value).then(async sqldata => {
      const users = [];
      for (let _row = 0; _row<sqldata.rowCount; _row++) {
        const row = sqldata.rows[_row];
        const permission = {
          user_type: row.user_type,
          admin: row.admin,
          user_read: row.user_read,
          demo: row.demo,
          user_manage: row.user_manage,
          twa: row.twa,
          dpr: row.dpr,
          longterm: row.longterm,
          forecast: row.forecast,
        };
        const target_token = {
          userID: row.userID,
          client_id,
          permission,
        }
        const vessels = await user_helper.getVesselsForUser(target_token);
        users.push({
          active: row.active,
          userID: row.user_id,
          username: row.username,
          client_name: row.client_name,
          client_id: row.client_id,
          vessel_ids: row.vessel_ids,
          permission,
          boats: vessels
        });
      }
      return res.send(users)
    }).catch(err => {
      res.onError(err)
    })
  });

  app.get("/api/getCompanies", function(req, res) {
    // Why does this function exists? We also have getClients
    const token = req['token'];
    if (!token.permission.admin) return res.onUnauthorized();
    const query = `SELECT "client_id", "client_name", "client_permissions"
      FROM "clientTable"`
    connections.admin.query(query).then((data) => {
      const clients = data.rows;
      const sorted = sortByStringField(clients, c => c.client_name);
      return res.send(sorted)
    }).catch(err => res.onError(err, 'Failed to get clients!'))
  });

  app.post("/api/updateUserPermissions",
    checkSchema(models.updateUserPermissionsModel),
    async function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      // Set user permissions for another user
      const token = req['token'];
      const own_permission = token['permission'];
      if (!own_permission.admin && !own_permission.user_manage) return res.onUnauthorized();

      const target_permission = req.body.permission;
      const target_username = req.body.username;
      const may_not_change_target = target_permission.admin
        // || target_permission.user_can_see_all_vessels_client
        || target_permission.user_type == 'admin';
      if (may_not_change_target) return res.onUnauthorized('Permissions for admins may not be changed!')

      if (!await user_helper.getPermissionToManageUser(token, target_username)) return res.onUnauthorized();
      const target_user_id = await user_helper.getIdForUser(target_username).catch(err => {
        return res.onBadRequest('Target user not found!')
      })
      const query = `
        UPDATE "userPermissionTable"
        SET
          "user_read"=$2, "demo"=$3, "user_manage"=$4, "twa"=$5,
          "dpr"=$6, "longterm"=$7, "user_type"=$8, "forecast"=$9
          WHERE "user_id"=$1
      `
      const values = [
        target_user_id,
        target_permission.user_read,
        target_permission.demo,
        target_permission.user_manage,
        target_permission.twa,
        target_permission.dpr,
        target_permission.longterm,
        target_permission.user_type,
        target_permission.forecast,
      ]
      connections.admin.query(query, values).then(() => {
        res.send({data: "Succesfully saved the permissions"})
      }).catch(err => res.onError(err))
  });


  app.post('/api/change-client-license',
    async function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      // Set user permissions for another user
      const token = req['token'];
      const own_permission = token['permission'];
      if (!own_permission.admin) return res.onUnauthorized()      

      const query = `
        UPDATE "clientTable"
        SET "client_permissions"= $1
        WHERE "client_id"=$2;
      `
    const values = [
      {"licenceType": `${req.body.value}`}
      ,
      req.body.client_id
    ]

    connections.admin.query(query, values).then((response) => {
      if(response.rowCount === 0) {
        res.onBadRequest('Target user not found!')
      }
      else{
        res.send({data: "Succesfully saved the licenceType"})
      }
    }).catch(err => {
      return res.onError(err)})
  })
}

