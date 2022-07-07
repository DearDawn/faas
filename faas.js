const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const {
  functionExist,
  resetFunction,
  getResp,
  getFunction,
  loadFunction,
  publishFunction,
} = require('./utils')

router.use('/get', (req, res, next) => {
  const { name: functionName = '' } = req.query || {}
  const filePath = path.join(__dirname, 'functions', functionName + '.js')

  if (!functionName) {
    res.send(getResp(10, '参数不能为空'))
    return
  }

  if (!functionExist(functionName)) {
    res.send(getResp(10, '函数不存在'))
    return
  }

  res.send(
    getResp(0, 'ok', {
      content: fs.readFileSync(filePath).toString(),
    })
  )
})

router.use('/list', (req, res, next) => {
  const functionsPath = path.join(__dirname, 'functions')

  if (fs.existsSync(functionsPath)) {
    const fileList = fs.readdirSync(functionsPath).filter((it) => it.endsWith('.js'))
    res.send(
      getResp(
        0,
        'ok',
        fileList.map((it) => {
          const name = it.replace(/\.js$/, '')
          console.log('[dodo] ', 'getFunction(name)', getFunction(name))
          return {
            name,
            file: it,
            url: '/functions/' + name,
            online: !!getFunction(name),
          }
        })
      )
    )
  } else {
    res.send(getResp(0, 'ok', []))
  }
})

router.use('/save', (req, res, next) => {
  const { name: functionName = '', content: fileContent = '' } = req.body || {}
  console.log('[dodo] ', 'req.body', req.body)
  const filePath = path.join(__dirname, 'functions', functionName + '.js')

  if (!functionName || !fileContent) {
    res.send(getResp(10, '参数不能为空'))
    return
  }

  if (!functionExist(functionName)) {
    res.send(getResp(10, '函数不存在'))
    return
  }

  fs.writeFileSync(filePath, fileContent)
  res.send(getResp(0, 'ok'))
})

router.use('/publish', (req, res, next) => {
  const { name: functionName = '' } = req.body || {}
  if (!functionName) {
    res.send(getResp(10, '参数不能为空'))
    return
  }

  if (!functionExist(functionName)) {
    res.send(getResp(10, '函数不存在'))
    return
  }

  publishFunction(functionName)
  res.send(getResp(0, 'ok'))
})

router.use('/create', (req, res, next) => {
  const { name: functionName = '' } = req.body || {}
  const filePath = path.join(__dirname, 'functions', functionName + '.js')

  if (!functionName) {
    res.send(getResp(10, '参数不能为空'))
    return
  }

  if (functionExist(functionName)) {
    res.send(getResp(10, '函数已存在'))
    return
  }

  fs.writeFileSync(filePath, "module.exports = (req, res) => {\n  res.end('Hello World!')\n}")
  res.send(getResp(0, 'ok'))
})

router.use('/clear', (req, res, next) => {
  const { name: functionName = '' } = req.body || {}
  if (!functionExist(functionName)) {
    next()
    return
  }

  resetFunction(functionName)
  res.send(getResp(0, 'ok'))
})

router.use('/', (req, res, next) => {
  res.send('Hello World faas')
})

module.exports = router
