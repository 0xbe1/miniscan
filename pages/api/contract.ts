import type { NextApiRequest, NextApiResponse } from 'next'
import { Network, Result } from '..'
import { getContract, GetContractData } from './utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result<GetContractData>>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  const getContractResult = await getContract(address, network)
  res.status(200).send(getContractResult)
}
