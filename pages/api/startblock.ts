import type { NextApiRequest, NextApiResponse } from 'next'
import { Network, Result } from '..'
import { getStartBlock } from './utils'

// Uncomment to debug
// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', JSON.stringify(request, null, 2))
//   return request
// })

// TODO: response type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result<number>>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  const getStartBlockResult = await getStartBlock(address, network)
  res.status(200).json(getStartBlockResult)
}
