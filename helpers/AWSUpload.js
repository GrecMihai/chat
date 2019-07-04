const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESSKEYID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'eu-central-1'
});

const S0 = new AWS.S3({});//create a new instance of s3 bucket
const upload = multer({//ca la vesna
  storage: multerS3({
    s3: S0,
    bucket: 'grecmihaibucket',
    acl: 'public-read',//access control list, manage access to your bucket
    metadata(req, file, cb){
      cb(null, {fieldName: file.fieldname});
    },
    key(req, file, cb){
      cb(null, file.originalname);
    }

  })
});

exports.Upload = upload;
