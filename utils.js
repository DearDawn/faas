const fs = require('fs')
const path = require('path')
const functionMap = {}
console.log('[dodo] ', '4444', 4444)

const functionExist = (name, ext = '.js') => {
  const filePath = path.join(__dirname, 'functions/' + name + ext)
  return fs.existsSync(filePath) && filePath
}

const loadFunction = (name) => {
  if (!functionMap[name]) {
    functionMap[name] = require(functionExist(name))
  } else {
    console.log('[dodo] ', 'no need load', name)
  }
}

const resetFunction = (name) => {
  if (functionMap[name]) {
    delete require.cache[functionExist(name)]
    functionMap[name] = require(functionExist(name))
    console.log('[dodo] ', 'reset', name, functionMap[name])
  } else {
    console.log('[dodo] ', 'no need reset', name)
  }
}

const publishFunction = (name) => {
  if (functionMap[name]) {
    delete require.cache[functionExist(name)]
  }
  functionMap[name] = require(functionExist(name))
}

const getFunction = (name) => {
  console.log('[dodo] ', 'functionMap', functionMap)
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
