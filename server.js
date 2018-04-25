const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require("morgan");
const express = require('express');




// use sqlite db

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const app = express();
const PORT = process.env.PORT || 4000;

app.use(errorHandler());
app.use(bodyParser.json());
app.use(cors());


// Get all current employees

app.get('/api/employees', (req, res, next) => {

    db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
    (error, employees) => {
        if(error) {
            next(error);
        } else {
            res.status(200).json({employees: employees});
        }
    });
});

// Delete employee by id

app.delete('/api/employees/:employeeId', (req, res, next) => {
    const sqlQuery = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
    const values = {$employeeId: req.params.employeeId};
console.log(req.params.employeeId);
    db.run(sqlQuery, values, (error) => {
        if(error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.Id = ${req.params.employeeId}`,
                (error, employee) => {
                    res.status(200).json({employee: employee});
            });
        }
    });
});

// Get all data by employee id


app.get('/api/employees/:employeeId', (req, res, next, employeeId) => {
    const sqlQuery = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const values = {$employeeId: req.params.employeeId};
    db.get(sqlQuery, values, (error, employee) => {
        if(error) {
            next(error);
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});


// update emplyee by id

app.put('/api/employees/:employeeId', (req, res, next) => {
    const name = req.body.employee.name,
          position = req.body.employee.position,
          wage = req.body.employee.wage,
          isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    const sqlQuery = 'UPDATE Employee SET name = $name, position = $position, ' +
        'wage = $wage, is_current_employee = $isCurrentEmployee ' +
        'WHERE Employee.Id = $employeeId';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };

    db.run(sqlQuery, values, (error) => {
        if(error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
                (error, employee) => {
                    res.status(200).json({employee: employee});
                });
        }
    });
});

// code above this line
app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

module.exports = app;
