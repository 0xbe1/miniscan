import type { NextApiRequest, NextApiResponse } from 'next'
import { Network } from '..'
import axios from 'axios'
import prettier from 'prettier'
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
          action: 'getsourcecode',
          address,
          apikey: config[network].apiKey,
        },
        timeout: API_TIMEOUT,
      }
    )
    if (data.status === '1') {
      res.status(200).json(data.result[0].SourceCode)
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
