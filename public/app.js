const request = async (url, method = 'GET', body = {}) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  }

  if (method === 'GET') {
    delete options.body
  }

  const response = await fetch(url, options)
  const text = await response.text()
  try {
    const data = JSON.parse(text)
    return data
  } catch (error) {
    return text
  }
}

function Debug(props) {
  const { funcInfo = {} } = props

  const [link, setLink] = React.useState('')
  const [body, setBody] = React.useState('{}')
  const [mode, setMode] = React.useState('GET')
  const [resp, setResp] = React.useState('')

  const handleSendRequest = React.useCallback(() => {
    let bodyObj = {}
    try {
      bodyObj = JSON.parse(body)
    } catch (error) {
      window.alert('请求体不是合法的JSON')
      return
    }

    request(link, 'POST', bodyObj).then((res) => {
      if (typeof res === 'string') {
        setResp(res)
      } else {
        setResp(JSON.stringify(res, null, 2))
      }
    })
  }, [body, link])

  const handleBodyChange = React.useCallback((e) => {
    const value = e.target.value
    setBody(value)
  }, [])

  React.useEffect(() => {
    setLink(`${funcInfo.test_url}`)
    setMode('GET')
    setResp('')
  }, [funcInfo])

  console.log('[dodo] ', 'mode', mode)

  return (
    <div className='debug-box'>
      <div className='req'>
        <select className='select' onChange={(e) => setMode(e.target.value)}>
          <option value='GET'>GET</option>
          <option value='POST'>POST</option>
        </select>
        <input
          className='link'
          type='text'
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button disabled={!funcInfo.name} onClick={handleSendRequest}>
          调试
        </button>
      </div>
      <textarea className='body' value={body} onChange={handleBodyChange}></textarea>
      <div className='response'>{resp || '返回值将在此处显示'}</div>
    </div>
  )
}

function App() {
  const [functionList, setFunctionList] = React.useState([])
  const [funcInfo, setFuncInfo] = React.useState({})
  const [functionContent, setFunctionContent] = React.useState('')
  const [contentChanged, setContentChanged] = React.useState(false)
  const [contentSaved, setContentSaved] = React.useState(false)
  const editor = React.useRef(null)

  const getList = React.useCallback((filterName = '') => {
    request('/api/faas/list').then((res) => {
      setFunctionList(res.data)
      let functionInfo = res.data[0] || {}
      const findFunc = res.data.find((it) => it.name === filterName) || functionInfo
      functionInfo = filterName ? findFunc : functionInfo
      setFuncInfo(functionInfo)
    })
  }, [])

  const handleFuncitonClick = React.useCallback((func) => {
    if (func.name !== funcInfo.name) {
      setContentChanged(false)
      setContentSaved(false)
    }

    setFuncInfo(func)
    if (editor.current) {
      editor.current.focus()
    }
  }, [])

  const handleCreate = React.useCallback(() => {
    const name = window.prompt('请输入函数名称', '')
    if (!name) return

    request('/api/faas/create', 'POST', { name })
      .then((res) => {
        console.log(res)
      })
      .finally(() => {
        setContentChanged(false)
        setContentSaved(true)
        getList(name)
      })
  }, [])

  const handleSave = React.useCallback(() => {
    request('/api/faas/save', 'POST', { name: funcInfo.name, content: functionContent })
      .then((res) => {
        console.log(res)
      })
      .finally(() => {
        setContentChanged(false)
        setContentSaved(true)
      })
  }, [funcInfo, functionContent])

  const handlePublish = React.useCallback(() => {
    request('/api/faas/publish', 'POST', { name: funcInfo.name })
      .then((res) => {
        console.log(res)
      })
      .finally(() => {
        setContentChanged(false)
        setContentSaved(false)
        getList(funcInfo.name)
      })
  }, [funcInfo])

  React.useEffect(() => {
    if (!funcInfo.name) {
      setFunctionContent('')
      return
    }

    setFunctionContent('')
    request(`/api/faas/get?name=${funcInfo.name}`).then((res) => {
      console.log(res.data)
      setFunctionContent(res.data.content || '')
    })
  }, [funcInfo])

  React.useEffect(() => {
    getList()
  }, [getList])

  return (
    <div className='container'>
      <div className='dev-box'>
        <div className='header'>
          <div className='options'>
            <button className='btn create' onClick={handleCreate}>
              新建
            </button>
          </div>
          <div className='link'>
            线上地址：
            <a target='_blank' href={funcInfo.url}>
              {funcInfo.url}
            </a>
          </div>
          <div className='options'>
            <button className='btn' disabled={!contentChanged} onClick={handleSave}>
              保存
            </button>
            <button
              className='btn'
              disabled={funcInfo.online && (contentChanged || !contentSaved)}
              onClick={handlePublish}
            >
              上线
            </button>
          </div>
        </div>
        <div className='editor'>
          <ul className='catalog'>
            {functionList.map((it) => (
              <li
                key={it.name}
                onClick={() => {
                  handleFuncitonClick(it)
                }}
                className={`item ${it.name === funcInfo.name ? 'active' : ''}  ${
                  it.online ? '' : 'offline'
                }`}
              >
                {it.file}
              </li>
            ))}
          </ul>
          <textarea
            ref={editor}
            className='textarea'
            value={functionContent}
            onChange={(e) => {
              setFunctionContent(e.target.value)
              setContentChanged(true)
            }}
          ></textarea>
        </div>
      </div>
      <Debug funcInfo={funcInfo} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
// console.log('[dodo] ', 'reload')
// setTimeout(() => {
//   window.location.reload()
// }, 10000)
