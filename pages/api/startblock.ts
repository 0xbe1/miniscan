import type { NextApiRequest, NextApiResponse } from 'next'
import { Result } from '..'
import axios from 'axios'

const API_TIMEOUT = 5000

// TODO: response type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  const address = req.query['address'] as string
  try {
    const { data } = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 1,
        sort: 'asc',
        apikey: process.env.ETHERSCAN_API_KEY,
      },
      timeout: API_TIMEOUT,
    })
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
    // TODO: log error
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
