import type { NextApiRequest, NextApiResponse } from 'next'
import { Network } from '..'
import { CodeType, getCode } from './utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | { message: string }>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  const codeType = req.query['codeType'] as CodeType

  const getCodeResult = await getCode(address, network, codeType)
  if (getCodeResult.error) {
    res.status(200).send(getCodeResult.error)
  } else {
    res.status(200).send(getCodeResult.data)
  }
}
