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
          action: 'getabi',
          address,
          apikey: config[network].apiKey,
        },
        timeout: API_TIMEOUT,
      }
    )
    if (data.status === '1') {
      let formatted = prettier.format(data.result, {
        // so that `graph codegen` works
        quoteProps: 'preserve',
        trailingComma: 'none',
        semi: false,
      })
      // remove heading semicolon because prettier always adds one
      if (formatted[0] === ';') {
        formatted = formatted.slice(1)
      }
      res.status(200).json(formatted)
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
