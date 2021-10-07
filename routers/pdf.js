const router = require('express').Router();
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');

const dir = 'uploads';
const fileName = uuidv4();

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      cb(null, fileName + '.png');
    },
  }),
});

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

router.post('/png-to-pdf', upload.single('file'), (req, res) => {
  let list = '';

  if (req.file) {
    list = `${req.file.path}`;

    exec(`magick convert -flatten ${list} ${fileName}.pdf`, async (err, stdout, stderr) => {
      if (err) throw err;

      const logo = await fs.readFileSync(`${fileName}.pdf`);

      res.send({ data: logo.toString('base64') });

      fs.unlinkSync(`${fileName}.pdf`);
      fs.unlinkSync(`${dir}/${fileName}.png`);
    });
  }
});

module.exports = router;
