const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const faasRouter = require('./faas.js')
const { getFunction, loadFunction, functionExist, getResp } = require('./utils.js')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
// static files
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use('/functions', (req, res, next) => {
  console.log('[dodo] ', 'req.path', req.path)

  const fileName = req.path.slice(1)
  const filePath = functionExist(fileName)

  if (!fileName || !filePath) {
    res.send(getResp(10, '函数不存在'))
    return
  }

  loadFunction(fileName)
  getFunction(fileName)(req, res)
})

app.use('/api/faas', faasRouter)

app.use('/', (req, res) => {
  res.send(fs.readFileSync(path.join(__dirname, 'client.html')).toString())
})

app.listen(7000, () => {
  console.log('Server is running')
})
