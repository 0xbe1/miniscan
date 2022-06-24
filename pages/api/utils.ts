import axios from 'axios'
import { Network, Result } from '..'

type Config = {
  [key in Network]: { scanDomain: string; apiDomain: string; apiKey: string }
}

export type CodeType = 'ABI' | 'SourceCode'

type GetSourceCodeData = {
  ABI: string
  ContractName: string
  Implementation: string
  Proxy: string
  SourceCode: string
}

export type GetContractData = {
  ContractName: string
  StartBlock: number
  ABI: string
}

type GetCodeData = {
  ContractName: string
  Code: string
}

type getStartBlockAction = 'txlist' | 'txlistinternal'

const API_TIMEOUT = 5000

export const config: Config = {
  ethereum: {
    scanDomain: 'etherscan.io',
    apiDomain: 'api.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
  bsc: {
    scanDomain: 'bscscan.com',
    apiDomain: 'api.bscscan.com',
    apiKey: process.env.BSCSCAN_API_KEY || '',
  },
  avalanche: {
    scanDomain: 'snowtrace.io',
    apiDomain: 'api.snowtrace.io',
    apiKey: process.env.SNOWTRACE_API_KEY || '',
  },
  fantom: {
    scanDomain: 'ftmscan.com',
    apiDomain: 'api.ftmscan.com',
    apiKey: process.env.FTMSCAN_API_KEY || '',
  },
  arbitrum: {
    scanDomain: 'arbiscan.io',
    apiDomain: 'api.arbiscan.io',
    apiKey: process.env.ARBISCAN_API_KEY || '',
  },
  polygon: {
    scanDomain: 'polygonscan.com',
    apiDomain: 'api.polygonscan.com',
    apiKey: process.env.POLYGONSCAN_API_KEY || '',
  },
  aurora: {
    scanDomain: 'aurorascan.dev',
    apiDomain: 'api.aurorascan.dev',
    apiKey: process.env.AURORASCAN_API_KEY || '',
  },
  optimism: {
    scanDomain: 'optimistic.etherscan.io',
    apiDomain: 'api-optimistic.etherscan.io',
    apiKey: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || '',
  },
  celo: {
    scanDomain: 'celoscan.xyz',
    apiDomain: 'api.celoscan.xyz',
    apiKey: process.env.CELOSCAN_API_KEY || '',
  },
  gnosis: {
    scanDomain: 'blockscout.com/xdai/mainnet',
    apiDomain: 'blockscout.com/xdai/mainnet',
    apiKey: '', // no api key needed
  },
  hsc: {
    scanDomain: 'hooscan.com',
    apiDomain: 'api.hooscan.com',
    apiKey: process.env.HOOSCAN_API_KEY || '',
  },
  moonriver: {
    scanDomain: 'moonriver.moonscan.io',
    apiDomain: 'api-moonriver.moonscan.io',
    apiKey: process.env.MOONRIVIER_MOONSCAN_API_KEY || '',
  },
  moonbeam: {
    scanDomain: 'moonbeam.moonscan.io',
    apiDomain: 'api-moonbeam.moonscan.io',
    apiKey: process.env.MOONBEAM_MOONSCAN_API_KEY || '',
  },
  cronos: {
    scanDomain: 'cronoscan.com',
    apiDomain: 'api.cronoscan.com',
    apiKey: process.env.CRONOSCAN_API_KEY || '',
  },
}

export async function getStartBlock(
  address: string,
  network: Network
): Promise<Result<number>> {
  let getStartBlockResult = await _getStartBlock(address, network, 'txlist')
  if (
    getStartBlockResult.error &&
    getStartBlockResult.error.message === 'No transactions found'
  ) {
    return _getStartBlock(address, network, 'txlistinternal')
  }
  return getStartBlockResult
}

async function _getStartBlock(
  address: string,
  network: Network,
  action: getStartBlockAction
): Promise<Result<number>> {
  try {
    const { data } = await axios.get(
      `https://${config[network].apiDomain}/api`,
      {
        params: {
          module: 'account',
          action,
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
      // TODO: add result type
      return { data: data.result[0].blockNumber }
    }
    return {
      error: {
        message: data.message,
      },
    }
  } catch (error: any) {
    console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return {
      error: {
        message: 'unknown error',
      },
    }
  }
}

export async function getCode(
  address: string,
  network: Network,
  codeType: CodeType
): Promise<Result<GetCodeData>> {
  try {
    const { data } = await axios.get(
      `https://${config[network].apiDomain}/api`,
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
    if (data.status === '0') {
      return {
        error: {
          message: data.message,
        },
      }
    }
    let result = data.result[0] as GetSourceCodeData

    // it is the implementation
    // or even if it claims to be a proxy, but the implementation address eq proxy address, such as Ethereum 0xc36442b4a4522e871399cd717abdd847ab11fe88 (Uniswap V3 Position NFT)
    if (result.Proxy === '0' || result.Implementation === address) {
      if (codeType === 'ABI') {
        return {
          data: {
            ContractName: result.ContractName,
            Code: result.ABI,
          },
        }
      }
      return {
        data: {
          ContractName: result.ContractName,
          Code: parseSourceCode(result.SourceCode),
        },
      }
    }

    // it is the proxy, go to implementation
    return getCode(result.Implementation, network, codeType)
  } catch (error: any) {
    console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return {
      error: {
        message: 'unknown error',
      },
    }
  }
}

// Added for cryptofees community
export async function getContract(
  address: string,
  network: Network
): Promise<Result<GetContractData>> {
  const getStartBlockResult = await getStartBlock(address, network)
  if (getStartBlockResult.error) {
    return {
      error: {
        message: getStartBlockResult.error.message,
      },
    }
  }
  const getABIResult = await getCode(address, network, 'ABI')
  if (getABIResult.error) {
    return {
      error: {
        message: getABIResult.error.message,
      },
    }
  }
  return {
    data: {
      ContractName: getABIResult.data.ContractName,
      StartBlock: getStartBlockResult.data,
      ABI: getABIResult.data.Code,
    },
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
