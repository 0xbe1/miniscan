import type { NextApiRequest, NextApiResponse } from 'next'
import { Network } from '..'
import axios from 'axios'
// import prettier from 'prettier'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { config } from './startblock'

const API_TIMEOUT = 5000

// string represents the formatted abi
// {error: ...} represents the error
type ResponseData = string | { error: { msg: string } }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  try {
    const { data } = await axios.get(
      `https://${config[network].scanDomain}/api`,
      {
        params: {
          module: 'contract',
          action: 'getabi',
          address,
          apikey: config[network].apiKey,
        },
        timeout: API_TIMEOUT,
      }
    )
    if (data.status === '1') {
      const abi = data.result
      res.setHeader('Content-Type', 'text/html')
      res.write(hljs.highlight(abi, { language: 'json' }).value)
      res.end()
    } else {
      res.status(200).json({
        error: {
          msg: data.message,
        },
      })
    }
  } catch (error: any) {
    console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    res.status(500).json({
      error: {
        msg: 'unknown error',
      },
    })
  }
}
