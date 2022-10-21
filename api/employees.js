const express = require('express')
const employeesRouter = express.Router({ mergeParams: true })

const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const timesheetsRouter = require('./timesheets')

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
	const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId'
	const values = { $employeeId: employeeId }
	db.get(sql, values, (error, employee) => {
		if (error) {
			next(error)
		} else if (employee) {
			req.employee = employee
			next()
		} else {
			res.sendStatus(404)
		}
	})
})

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter)

employeesRouter.get('/', (req, res, next) => {
	const sql = 'SELECT * FROM Employee WHERE Employee.is_current_employee = 1'
	db.all(sql, (error, employees) => {
		if (error) {
			next(error)
		} else {
			res.status(200).json({ employees: employees })
		}
	})
})

employeesRouter.post('/', (req, res, next) => {
	const { name, position, wage } = req.body.employee
	const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1

	if (!name || !position || !wage) {
		return res.sendStatus(400)
	}

	const sql =
		'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)'
	const values = {
		$name: name,
		$position: position,
		$wage: wage,
		$isCurrentEmployee: isCurrentEmployee
	}

	db.run(sql, values, function (error) {
		if (error) {
			next(error)
		} else {
			db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (error, employee) => {
				res.status(201).json({ employee: employee })
			})
		}
	})
})

employeesRouter.get('/:employeeId', (req, res, next) => {
	const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId'
	const values = { $employeeId: req.params.employeeId }
	db.get(sql, values, (error, employee) => {
		if (error) {
			next(error)
		} else {
			res.status(200).json({ employee: employee })
		}
	})
})

employeesRouter.put('/:employeeId', (req, res, next) => {
	const { name, position, wage } = req.body.employee
	const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1

	if (!name || !position || !wage) {
		return res.sendStatus(400)
	}

	const sql =
		'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $employeeId'
	const values = {
		$name: name,
		$position: position,
		$wage: wage,
		$isCurrentEmployee: isCurrentEmployee,
		$employeeId: req.params.employeeId
	}

	db.run(sql, values, function (error) {
		if (error) {
			next(error)
		} else {
			db.get(
				`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
				(error, employee) => {
					res.status(200).json({ employee: employee })
				}
			)
		}
	})
})

employeesRouter.delete('/:employeeId', (req, res, next) => {
	const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId'
	const values = { $employeeId: req.params.employeeId }

	db.run(sql, values, function (error) {
		if (error) {
			next(error)
		} else {
			db.get(
				`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
				(error, employee) => {
					res.status(200).json({ employee: employee })
				}
			)
		}
	})
})

employeesRouter.get('/:employeeId/timesheets', (req, res, next) => {
	const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId'
	const values = { $employeeId: req.params.employeeId }
	db.all(sql, values, (error, timesheets) => {
		if (error) {
			next(error)
		} else {
			res.status(200).json({ timesheets: timesheets })
		}
	})
})

employeesRouter.post('/:employeeId/timesheets', (req, res, next) => {
	const { hours, rate, date } = req.body.timesheet

	if (!hours || !rate || !date) {
		return res.sendStatus(400)
	}

	const sql =
		'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)'
	const values = {
		$hours: hours,
		$rate: rate,
		$date: date,
		$employeeId: req.params.employeeId
	}

	db.run(sql, values, function (error) {
		if (error) {
			next(error)
		} else {
			db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (error, timesheet) => {
				res.status(201).json({ timesheet: timesheet })
			})
		}
	})
})

employeesRouter.put('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
	const { hours, rate, date } = req.body.timesheet

	if (!hours || !rate || !date) {
		return res.sendStatus(400)
	}

	const sql =
		'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE Timesheet.id = $timesheetId'
	const values = {
		$hours: hours,
		$rate: rate,
		$date: date,
		$timesheetId: req.params.timesheetId
	}

	db.run(sql, values, error => {
		if (error) {
			next(error)
		} else {
			db.get(
				`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
				(error, timesheet) => {
					if (error) {
						return res.sendStatus(404)
						next(error)
					} else {
						res.status(200).json({ timesheet })
					}
				}
			)
		}
	})
})

employeesRouter.delete('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
	const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId'
	const values = { $timesheetId: req.params.timesheetId }

	db.run(sql, values, function (error) {
		if (error) {
			next(error)
		} else {
			res.sendStatus(204)
		}
	})
})

module.exports = employeesRouter
