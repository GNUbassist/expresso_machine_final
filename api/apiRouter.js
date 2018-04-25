
const express = require('express');
const apiRouter = express.Router();
module.exports = apiRouter;


const employeesRouter = require('./employees');
apiRouter.use('/employees', employeesRouter);


const menusRouter = require('./menus');
apiRouter.use('/menus', menusRouter);
