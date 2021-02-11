var uploader = require('express-fileupload')
var jwt = require("jsonwebtoken");


module.exports = function (app, logger) {
  app.use(uploader({
    createParentPath: true
  }))
  
  function unauthorized(res, cause = 'unknown') {
    logger.warning(`Unauthorized request: ${cause}`)
    res.status(401).send('Unauthorized request')
  }

  function verifyToken(req, res) {
    try {
      if (!req.headers.authorization) unauthorized(res, 'Missing headers');

      const token = req.headers.authorization;
      if (token == null || token === 'null')  unauthorized(res, 'Token missing!')

      const payload = jwt.verify(token, 'secretKey');
      if (payload == null || payload == 'null')  unauthorized(res, 'Token corrupted!')
      return payload;
    } catch (err) {
      logger.error(err);
      res.status(500).send('Failed to parse jwt token')
    }
  }

  app.post('/api/upload/hullLines', async (req, res) => {
    // ToDo: Add some kind of security check regarding the token
    const token = verifyToken(req, res);
    if (!token) return;

    try {
      if(!req.files) {
        return res.send({
          status: false,
          message: 'No file uploaded'
        });
      }
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let lines = req.files.file;
      logger.info('Received new file ' + lines.name)
      
      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      lines.mv('./uploads/' + lines.name);

      //send response
      res.send({
        status: true,
        message: 'File is uploaded',
        data: {
          name: lines.name,
          mimetype: lines.mimetype,
          size: lines.size
        }
      });
    } catch (err) {
      logger.error(err)
      res.status(500).send(err);
    }
  });
}