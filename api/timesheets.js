const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
module.exports = timesheetsRouter;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



// verify timesheet by id



timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (error, row) => {
    if(error) {
      next(error);
    } else if(row){
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


//get all row data for specific employee id

timesheetsRouter.get('/', (req, res, next) => {
  const employeeId = req.params.employeeId;
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${employeeId}`, (error, rows) => {
    if(error) {
      next(error);
    } else {
      res.status(200).send({timesheets: rows});
    }
  });
});

///////////////////////////////
// update employee time sheet
//////////////////////////////

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;

// check if resource exists

  if(!hours || !rate || !date) {
    return res.sendStatus(400);
  }
// insert into data base
  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId
  };

// verify row columns updated

  db.run(sql, values, function(error){
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (error, row) => {
        res.status(201).send({timesheet: row});
      });
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        timesheetId = req.params.timesheetId;



  if(!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $timesheetId';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $timesheetId: timesheetId
  };
  db.run(sql, values, error => {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (error, row) => {
        res.status(200).send({timesheet: row});
      });
    }
  });
});


// delete employee time sheet



timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  db.run(`DELETE FROM Timesheet WHERE id = ${timesheetId}`, error => {
    if(error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});
