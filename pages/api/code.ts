import type { NextApiRequest, NextApiResponse } from 'next'
import { Network } from '..'
import axios from 'axios'
import prettier from 'prettier'
import { config } from './utils'

const API_TIMEOUT = 5000

type GetSourceCodeResult = {
  ABI: string
  ContractName: string
  Implementation: string
  Proxy: string
  SourceCode: string
}

type CodeType = 'ABI' | 'SourceCode'

type ResponseData = string | { error: { msg: string } }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  const codeType = req.query['codeType'] as CodeType

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
    if (data.status !== '1') {
      res.status(200).json({
        error: {
          msg: data.message,
        },
      })
      return
    }
    let result = data.result[0] as GetSourceCodeResult

    // it is the implementation
    if (result.Proxy === '0') {
      if (codeType === 'ABI') {
        res.status(200).json(formatABI(result.ABI))
      } else {
        res.status(200).send(parseSourceCode(result.SourceCode))
      }
      return
    }

    // it is the proxy, go to implementation
    const { data: implementationData } = await axios.get(
      `https://${config[network].scanDomain}/api`,
      {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: result.Implementation,
          apikey: config[network].apiKey,
        },
        timeout: API_TIMEOUT,
      }
    )
    if (implementationData.status !== '1') {
      res.status(200).json({
        error: {
          msg: implementationData.message,
        },
      })
      return
    }
    let implementationResult = implementationData
      .result[0] as GetSourceCodeResult
    if (codeType === 'ABI') {
      res.status(200).json(formatABI(implementationResult.ABI))
    } else {
      res.status(200).send(parseSourceCode(implementationResult.SourceCode))
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

function parseSourceCode(sourceCode: string): string {
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
  return sourceCode
}

function filterOutSolidityFileHeader(sourceCode: string): string {
  const lines = sourceCode.split('\n')
  const filteredLines = lines.filter((line) => {
    return !line.startsWith('pragma solidity') && !line.startsWith('import')
  })
  return filteredLines.join('\n')
}

function formatABI(abi: string): string {
  let formatted = prettier.format(abi, {
    // so that `graph codegen` works
    quoteProps: 'preserve',
    trailingComma: 'none',
    semi: false,
  })
  // remove heading semicolon because prettier always adds one
  if (formatted[0] === ';') {
    formatted = formatted.slice(1)
  }
  return formatted
}
