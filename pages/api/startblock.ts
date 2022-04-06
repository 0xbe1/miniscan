import type { NextApiRequest, NextApiResponse } from 'next'
import { Network, Result } from '..'
import axios from 'axios'

const API_TIMEOUT = 5000

type Config = {
  [key in Network]: { domain: string; apiKey: string }
}

const config: Config = {
  ethereum: {
    domain: 'etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
  bsc: {
    domain: 'bscscan.com',
    apiKey: process.env.BSCSCAN_API_KEY || '',
  },
  avalanche: {
    domain: 'snowtrace.io',
    apiKey: process.env.SNOWTRACE_API_KEY || '',
  },
  fantom: {
    domain: 'ftmscan.com',
    apiKey: process.env.FTMSCAN_API_KEY || '',
  },
  arbitrum: {
    domain: 'arbiscan.io',
    apiKey: process.env.ARBISCAN_API_KEY || '',
  },
  polygon: {
    domain: 'polygonscan.com',
    apiKey: process.env.POLYGONSCAN_API_KEY || '',
  },
}

// Uncomment to debug
// axios.interceptors.request.use(request => {
//   console.log('Starting Request', JSON.stringify(request, null, 2))
//   return request
// })

// TODO: response type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  try {
    const { data } = await axios.get(
      `https://api.${config[network].domain}/api`,
      {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 1,
          sort: 'asc',
          apikey: config[network].apiKey,
        },
        timeout: API_TIMEOUT,
      }
    )
    if (data.status === '1') {
      res.status(200).json({
        data: {
          blockNumber: data.result[0].blockNumber,
        },
      })
    } else {
      res.status(200).json({
        data: {
          blockNumber: 0,
        },
        error: {
          msg: data.message,
        },
      })
    }
  } catch (error: any) {
    console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    res.status(500).json({
      data: {
        blockNumber: 0,
      },
      error: {
        msg: 'unknown error',
      },
    })
  }
}
