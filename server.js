const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const faasRouter = require('./faas.js')
const { getFunction, loadFunction, functionExist, getResp } = require('./utils.js')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
// static files
app.use('/public/faas', express.static(path.join(__dirname, 'public')))

app.use('/functions', (req, res, next) => {
  console.log('[dodo] ', 'req.path', req.path)
  const { test } = req.query || {}

  const fileName = req.path.slice(1)
  const filePath = functionExist(fileName)

  if (!fileName || !filePath) {
    res.send(getResp(10, '函数不存在'))
    return
  }

  try {
    loadFunction(fileName)
    getFunction(fileName, test === '1')(req, res)
  } catch (error) {
    const errorInfo = `${error.name}\n${error.message}\n${error.stack}`
    console.log('[dodo] ', 'error', errorInfo)
    res.send(getResp(500, 'error', errorInfo))
    return
  }
})

app.use('/api/faas', faasRouter)

app.use('/', (req, res) => {
  res.send(fs.readFileSync(path.join(__dirname, 'client.html')).toString())
})

app.listen(7001, () => {
  console.log('Server is running')
})
