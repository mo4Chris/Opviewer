const text = `SELECT user_id FROM "userTable"`;
      
admin_server_pool.query(text).then(user =>{
  
  user.rows.forEach(element => {
    const text2 = 'INSERT INTO "userSettingsTable"(user_id, timezone, unit, longterm, weather_chart) VALUES($1, $2, $3, $4, $5)';
    const values2 = [
      element.user_id, 
      {"type":"vessel","fixedTimeZoneOffset":0,"fixedTimeZoneLoc":"Europe/London"}, 
      {"distance":"km","speed":"km/h","weight":"ton","gps":"DMS"}, 
      {"filterFailedTransfers":1},
      {"Hs":false, "windAvg":false, "V2v_transfers":false, "Turbine_transfers":false, "Platform_transfers":false, "Transit":false, "Vessel_transfers":false} 
    ];
    admin_server_pool.query(text2, values2).catch(err => {
        onError(res,err);
      })

  });
})
.catch(err => {
  onError(res,err);
})



Usermodel.find({
    active: {$ne: 0},
  },{
    username: 1,
    client: 1,
    secret2fa: 1,
    password: 1,
    active: 1
  }, (err,data) => {
    if (err) return onError(res,err);
    
    data.forEach(user => {
      if (user.client == "BMO") user.client = 'MO4'

      const values = [user.username, user.secret2fa, user.password, true, true];

      const text = `INSERT INTO "userTable"(username, secret2fa, password, requires2fa, active, client_ID)
      VALUES($1, $2, $3, $4, $5, $6)`;

      const text2 = `UPDATE "userTable"
      SET "client_id" = "clientTable"."client_id"
      FROM "clientTable"
      WHERE "clientTable"."client_name" = $1 AND "userTable"."username"=$2`;

      const values2 = [user.client, user.username];

      admin_server_pool.query(text, values)
      .catch(err => {
        onError(res,err);
      })

      admin_server_pool.query(text2, values2)
      .catch(err => {
        onError(res,err);
      })
    })
  })
