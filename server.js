
const express = require('express');
const app = express();
module.exports = app;


const PORT = process.env.PORT || 4000;


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
app.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}`);
});


const bodyParser = require('body-parser');
app.use(bodyParser.json());

const errorhandler = require('errorhandler');
app.use(errorhandler());

const morgan = require('morgan');
app.use(morgan('dev'));

const cors = require('cors');
app.use(cors());


const apiRouter = require('./api/apiRouter');
app.use('/api', apiRouter);
