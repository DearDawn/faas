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

const port = 7001
app.listen(port, () => {
  console.log(`Server is running, goto: http://localhost:${port}`)
})

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017/testdb'
// const url = 'mongodb://10.227.30.96:27017/testdb'
// const url = 'mongodb://122.51.49.61:27017/testdb'

MongoClient.connect(url, async function (err, db) {
  if (err) throw err

  // 退出时关闭数据库
  process.on('exit', () => db.close())

  global.mongodb = db.db()
  const list = await mongodb.collection('site').find().toArray()
  const obj = { name: '连接测试', url: `第${list.length + 1}条数据`, time: new Date() }
  const res = await mongodb.collection('site').insertOne(obj)
  console.log('文档插入成功', res)
})
