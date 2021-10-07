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

router.post(
  '/png-to-ps',
  upload.single('file'),
  (req, res, next) => {
    let list = '';

    if (req.file) {
      list = `${req.file.path}`;

      exec(`magick convert -flatten ${list} ${fileName}.svg`, async (err, stdout, stderr) => {
        if (err) throw err;

        const logo = await fs.readFileSync(`${fileName}.svg`);

        res.locals.svg = logo;
        console.log(`http://localhost:3000/${fileName}.svg`);
        fs.unlinkSync(`${fileName}.svg`);
        fs.unlinkSync(`${dir}/${fileName}.png`);
        next();
      });
    }
  },
  (req, res) => {
    // console.log(, 'svg');
    const url = `https://vector.express/api/v2/public/convert/svg/librsvg`;

    axios({
      url: `${url}/ps`,
      method: 'POST',
      data: res.locals.svg,
    })
      .then(({ data }) => {
        res.json({
          id: data.id,
          inputUrl: data.inputUrl,
          resultUrl: data.resultUrl,
          time: data.time,
          format: data.format,
        });
      })
      .catch((err) => {
        console.log(err.response);
        res.status(400).json({ message: 'error' });
      });
  },
);

module.exports = router;
