const express = require('express')
const app = express()

const apiRouter = require('./api/api')

// const sqlite3 = require('sqlite3')
// const db = new sqlite3.Database(process.env.DATABASE || './db.sqlite')

const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))

app.use('/api', apiRouter)

const PORT = process.env.PORT || 4000

app.get('/', (req, res) => {
	res.send('Fernando!')
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

module.exports = app
