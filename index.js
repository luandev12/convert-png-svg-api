const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ credentials: true, origin: true, exposedHeaders: '*' }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname));

app.use('/', require('./routers/index'));

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
