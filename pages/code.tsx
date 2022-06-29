import axios from 'axios'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Prism from 'prismjs'
// import loadLanguages from 'prismjs/components/'
import 'prismjs/components/prism-solidity'
// import 'prismjs/themes/prism-dark.css'
import { Result } from '.'
import { GetCodeData } from './api/utils'

// loadLanguages(['javascript'])

const Code: NextPage = () => {
  const router = useRouter()
  const query = router.query
  const network = query['network'] as string
  const address = query['address'] as string
  const codeType = query['codeType'] as string

  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => {
    Prism.highlightAll()
  }, [code])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const resp = await axios.get('api/code', {
          params: {
            network,
            address,
            codeType,
          },
        })
        const result = resp.data as Result<GetCodeData>
        if (result.error) {
          setErrMsg(result.error.message)
        } else {
          setCode(result.data.Code)
        }
      } catch (error: any) {
        setErrMsg(error.message)
        setCode(null)
      }
      setLoading(false)
    }
    if (router.isReady) {
      fetchData()
    }
  }, [router.query])

  if (loading) {
    return <div>loading ...</div>
  }
  if (!code) {
    return <div>no code</div>
  }
  return <pre className="language-solidity"><code className="language-solidity">{code}</code></pre>
  // const html = Prism.highlight(code, Prism.languages.solidity, 'solidity');
  // return <div dangerouslySetInnerHTML={{__html: html}}/>
}

export default Code
