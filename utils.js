const fs = require('fs')
const path = require('path')
const functionMap = {}
const timerMap = {}
console.log('[dodo] ', '4444', 4444)

const functionExist = (name, ext = '.js') => {
  const filePath = path.join(__dirname, 'functions/' + name + ext)
  return fs.existsSync(filePath) && filePath
}

const loadFunction = (name) => {
  const freeFunction = () => {
    timerMap[name] = setTimeout(() => {
      delete require.cache[functionExist(name)]
      delete functionMap[name]
    }, 60000)
  }

  if (!functionMap[name]) {
    functionMap[name] = require(functionExist(name))
    freeFunction()
  } else {
    if (timerMap[name]) {
      clearTimeout(timerMap[name])
      freeFunction()
    }
    console.log('[dodo] ', 'no need load', name)
  }
}

const resetFunction = (name) => {
  if (functionMap[name]) {
    delete require.cache[functionExist(name)]
    loadFunction(name)
    console.log('[dodo] ', 'reset', name, functionMap[name])
  } else {
    console.log('[dodo] ', 'no need reset', name)
  }
}

const publishFunction = (name) => {
  if (functionMap[name]) {
    delete require.cache[functionExist(name)]
  }

  const tempPath = functionExist(name) + '_temp'
  const tempExist = fs.existsSync(tempPath)
  let err = false

  if (tempExist) {
    fs.copyFileSync(tempPath, functionExist(name))
    fs.rmSync(tempPath)
  } else {
    err = true
  }

  loadFunction(name)
  if (err) throw new Error('已是最新版本，无需发布')
}

const getFunction = (name, isTest) => {
  console.log('[dodo] ', 'functionMap', functionMap)

  if (isTest) {
    const tempPath = functionExist(name) + '_temp'
    const tempExist = fs.existsSync(tempPath)
    if (tempExist) {
      delete require.cache[functionExist(name)]
      return require(tempExist ? tempPath : functionExist(name))
    }
  }

  return functionMap[name]
}

const getResp = (status = 0, message, data = {}) => {
  return {
    status,
    message,
    data,
  }
}

module.exports = {
  functionExist,
  loadFunction,
  resetFunction,
  getFunction,
  publishFunction,
  getResp,
}
