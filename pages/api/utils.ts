import { Network } from '..'

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
