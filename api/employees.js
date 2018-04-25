const express = require('express');
const employeesRouter = express.Router({mergeParams: true});

const bodyParser = require('body-parser');
employeesRouter.use(bodyParser.json());

const timesheetsRouter = require('./timesheets.js');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.is_current_employee = 1';
  db.all(sql, (err, employee) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({employees: employee});
    }
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  const sql = 'SELECT * FROM Employee WHERE id = $id';
  const placeHolders = { $id: req.params.employeeId };
  db.get(sql, placeHolders, (err, employee) => {
    if (err) {
      next(err);
    } else if (employee) {
      res.status(200).json({employee: employee});
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.post('/', (req, res, next) => {
  if (!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $is_current_employee)';
  const values = {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage,
    $is_current_employee: 1
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (error, employee) => {
          res.status(201).json({employee: employee});
        });
    }
  });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  if (!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
    return res.sendStatus(400);
  }

  const sql = `Update Employee ` +
              `SET name = $name, position = $position, wage = $wage, is_current_employee = $is_current_employee ` +
              `WHERE id = ${req.params.employeeId}`;
  const values = {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage,
    $is_current_employee: 1
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = `Update Employee ` +
              `SET is_current_employee = 0 ` +
              `WHERE id = ${req.params.employeeId}`;

  db.run(sql, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

module.exports = employeesRouter;
