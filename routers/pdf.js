const router = require('express').Router();
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const pdf2base64 = require('pdf-to-base64');

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

router.post(
  '/png-to-pdf',
  upload.single('file'),
  (req, res, next) => {
    let list = '';

    if (req.file) {
      list = `${req.file.path}`;

      exec(`magick convert -flatten ${list} ${fileName}.svg`, async (err, stdout, stderr) => {
        if (err) throw err;

        const logo = await fs.readFileSync(`${fileName}.svg`);

        res.locals.svg = logo;

        fs.unlinkSync(`${fileName}.svg`);
        fs.unlinkSync(`${dir}/${fileName}.png`);
        next();
      });
    }
  },
  (req, res) => {
    const url = `https://vector.express/api/v2/public/convert/svg/librsvg`;

    axios({
      url: `${url}/pdf`,
      method: 'POST',
      data: res.locals.svg,
    })
      .then(async (result) => {
        pdf2base64(result.data.resultUrl)
          .then((response) => {
            res.json({
              id: result.data.id,
              inputUrl: result.data.inputUrl,
              resultUrl: response,
              time: result.data.time,
              format: result.data.format,
            });
          })
          .catch((error) => {
            console.log(error); //Exepection error....
          });
      })
      .catch((err) => {
        console.log(err.response);
        res.status(400).json({ message: 'error' });
      });
  },
);

module.exports = router;
