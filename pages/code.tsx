import axios from 'axios'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Result } from '.'
import { GetCodeData } from './api/utils'

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
    return (
      <div className="flex h-screen items-center justify-center text-3xl">
        loading ...
      </div>
    )
  }
  if (!code) {
    return (
      <div className="flex h-screen items-center justify-center text-3xl text-red-600">
        {errMsg}
      </div>
    )
  }

  return (
    <SyntaxHighlighter
      language={codeType === 'ABI' ? 'javascript' : 'solidity'}
      showLineNumbers
    >
      {code}
    </SyntaxHighlighter>
  )
}

export default Code
