const express = require('express')
const apiRouter = express.Router()

const employeeRouter = require('./employees')
const timesheetsRouter = require('./timesheets')
const menusRouter = require('./menus')

apiRouter.use('/employees', employeeRouter)
apiRouter.use('/timesheets', timesheetsRouter)
apiRouter.use('/menus', menusRouter)

module.exports = apiRouter
