import type { NextApiRequest, NextApiResponse } from 'next'
import { Network } from '..'
import axios from 'axios'
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
      let sourceCode = data.result[0].SourceCode
      // there are cases when source code is hidden deeper, see below
      try {
        const jsonStr = sourceCode.substring(1, sourceCode.length - 1)
        const obj = JSON.parse(jsonStr)
        sourceCode = Object.entries<{ content: string }>(obj.sources).reduce(
          (prev, curr, i) =>
            prev +
            '\n' +
            (i === 0
              ? curr[1].content
              : filterOutSolidityFileHeader(curr[1].content)),
          ''
        )
      } catch (error: any) {
        // ignore
      }
      res.status(200).send(sourceCode)
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

function filterOutSolidityFileHeader(sourceCode: string) {
  const lines = sourceCode.split('\n')
  const filteredLines = lines.filter((line) => {
    return !line.startsWith('pragma solidity') && !line.startsWith('import')
  })
  return filteredLines.join('\n')
}
