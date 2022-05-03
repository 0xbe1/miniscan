import type { NextApiRequest, NextApiResponse } from 'next'
import { Network, StartblockResult } from '..'
import axios from 'axios'

const API_TIMEOUT = 5000

type Config = {
  [key in Network]: { scanDomain: string; apiKey: string }
}

export const config: Config = {
  ethereum: {
    scanDomain: 'api.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
  bsc: {
    scanDomain: 'api.bscscan.com',
    apiKey: process.env.BSCSCAN_API_KEY || '',
  },
  avalanche: {
    scanDomain: 'api.snowtrace.io',
    apiKey: process.env.SNOWTRACE_API_KEY || '',
  },
  fantom: {
    scanDomain: 'api.ftmscan.com',
    apiKey: process.env.FTMSCAN_API_KEY || '',
  },
  arbitrum: {
    scanDomain: 'api.arbiscan.io',
    apiKey: process.env.ARBISCAN_API_KEY || '',
  },
  polygon: {
    scanDomain: 'api.polygonscan.com',
    apiKey: process.env.POLYGONSCAN_API_KEY || '',
  },
  aurora: {
    scanDomain: 'api.aurorascan.dev',
    apiKey: process.env.AURORASCAN_API_KEY || '',
  },
  optimism: {
    scanDomain: 'api-optimistic.etherscan.io',
    apiKey: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || '',
  },
  celo: {
    scanDomain: 'explorer.celo.org',
    apiKey: '', // no api key needed
  },
  gnosis: {
    scanDomain: 'blockscout.com/xdai/mainnet',
    apiKey: '', // no api key needed
  },
  hsc: {
    scanDomain: 'api.hooscan.com',
    apiKey: process.env.HOOSCAN_API_KEY || '',
  },
  moonriver: {
    scanDomain: 'api-moonriver.moonscan.io',
    apiKey: process.env.MOONRIVIER_MOONSCAN_API_KEY || '',
  },
  moonbeam: {
    scanDomain: 'api-moonbeam.moonscan.io',
    apiKey: process.env.MOONBEAM_MOONSCAN_API_KEY || '',
  },
}

// Uncomment to debug
// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', JSON.stringify(request, null, 2))
//   return request
// })

// TODO: response type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StartblockResult>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  try {
    const { data } = await axios.get(
      `https://${config[network].scanDomain}/api`,
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
