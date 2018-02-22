/**
 * Created by thihara on 12/9/16.
 */
let express = require('express')
let bodyParser = require('body-parser')
let notifications = require('./notification')

let app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('static'))

notifications.registerRoutes(app)

app.get('/status', function (req, res) {
  res.send('Server Running!')
})

// app.post('/status/:id', function (req, res) {
//   res.json({...})
// })

let PORT = process.env.PORT || 8080
app.listen(PORT, function () {
  console.log(`push_server listening on port ${PORT}!`)
})
