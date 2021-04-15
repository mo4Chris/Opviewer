Vesselmodel.find({
},{
  mmsi: 1,
  client: 1,
}, (err,data) => {
  if (err) return onError(res,err);
  
  data.forEach(user => {

    // const values = [user.mmsi, user.nicename, user.operationsClass, user.onHire];
    // const text = ` "vesselTable"(mmsi, nicename, operations_class, active)
    // VALUES($1, $2, $3, $4)`;
    user.client.forEach(clientname => {
    const text2 = `UPDATE "vesselTable" 
    SET client_ids=array_append("vesselTable"."client_ids", "clientTable"."client_id")
    FROM "clientTable"
    WHERE "clientTable"."client_name" = $1 AND "vesselTable"."mmsi"=$2`;
    const values2 = [clientname, user.username];

    admin_server_pool.query(text2, values2)
    .catch(err => {
      onError(res,err);
    })

    });
  })
})


Vesselmodel.find({
    },{
        mmsi: 1,
        nicename: 1,
        operationsClass: 1,
        onHire: 1
    }, (err,data) => {
        if (err) return onError(res,err);
        
        data.forEach(user => {


        const values = [user.mmsi, user.nicename, user.operationsClass, user.onHire];

        const text = `INSERT INTO "vesselTable"(mmsi, nicename, operations_class, active)
        VALUES($1, $2, $3, $4)`;

        // const text2 = `UPDATE "userTable"
        // SET "client_id" = "clientTable"."client_id"
        // FROM "clientTable"
        // WHERE "clientTable"."client_name" = $1 AND "userTable"."username"=$2`;
        // // const values2 = [user.client, user.username];
        
        admin_server_pool.query(text, values)
        .catch(err => {
            onError(res,err);
        })
    })
})
