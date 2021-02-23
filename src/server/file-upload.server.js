var uploader = require('express-fileupload')
var jwt = require("jsonwebtoken");


module.exports = function (app, logger, mailer) {
  app.use(uploader({
    createParentPath: true
  }))
  
  function onUnauthorized(res, cause = 'unknown') {
    logger.warn(`Unauthorized request: ${cause}`)
    if (cause == 'unknown') {
      res.status(401).send('Unauthorized request')
    } else {
      res.status(401).send(`Unauthorized: ${cause}`)
    }
  }
  function onError(res, err, additionalInfo = 'Internal server error') {
    if (typeof(err) == 'object') {
      err.debug = additionalInfo;
    } else {
      err = {
        debug: additionalInfo,
        msg: err,
        error: err,
      }
    }
    logger.error(err)
    res.status(500).send(additionalInfo);
  }

  function verifyToken(req, res) {
    try {
      if (!req.headers.authorization) onUnauthorized(res, 'Missing headers');

      const token = req.headers.authorization;
      if (token == null || token === 'null')  onUnauthorized(res, 'Token missing!')

      const payload = jwt.verify(token, 'secretKey');
      if (payload == null || payload == 'null')  onUnauthorized(res, 'Token corrupted!')
      return payload;
    } catch (err) {
      if (err) onError(res, err, 'Failed to parse jwt token')
    }
  }

  app.post('/api/upload/hullLines', async (req, res) => {
    // ToDo: Add some kind of security check regarding the token
    const token = verifyToken(req, res);
    if (!token) return;

    try {
      if(!req.files) return res.status(400).send('No file uploaded');

      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let lines = req.files.file;
      logger.info('Received new file ' + lines.name)
      
      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      const uploadPath = process.env.UPLOAD_FOLDER;
      const newFileName = 'HULL_LINES_' + lines.name;
      lines.mv(uploadPath + '/' + newFileName, err => {
        if (err) return onError(res, err, 'Failed to save file')
      });

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

      const body = `File ${newFileName} was just uploaded to the web server\n
        Files are stored in ${uploadPath}.`

      // send email
      mailer(process.env.EMAIL, body, 'web master')
    } catch (err) {
      return onError(err);
    }
  });
}