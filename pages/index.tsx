import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Select from 'react-select'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { useQueryState } from 'next-usequerystate'
import { config, GetContractData } from './api/utils'
import Link from 'next/link'

export type Result<T> =
  | {
      data: T
      error?: never
    }
  | {
      data?: never
      error: { message: string }
    }

interface NetworkOption {
  readonly value: Network
  readonly label: string
}

const networkOptions: readonly NetworkOption[] = [
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'aurora', label: 'Aurora' },
  { value: 'avalanche', label: 'Avalanche' },
  { value: 'bsc', label: 'BSC' },
  { value: 'celo', label: 'Celo' },
  { value: 'cronos', label: 'Cronos' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'fantom', label: 'Fantom' },
  { value: 'gnosis', label: 'Gnosis (API unreliable)' },
  { value: 'hsc', label: 'HSC' },
  { value: 'moonbeam', label: 'Moonbeam' },
  { value: 'moonriver', label: 'Moonriver' },
  { value: 'optimism', label: 'Optimism' },
  { value: 'polygon', label: 'Polygon' },
]

export type Network =
  | 'arbitrum'
  | 'aurora'
  | 'avalanche'
  | 'bsc'
  | 'celo'
  | 'cronos'
  | 'ethereum'
  | 'fantom'
  | 'gnosis'
  | 'hsc'
  | 'moonbeam'
  | 'moonriver'
  | 'optimism'
  | 'polygon'

function validateAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

const AbiEvent = ({
  entry,
  network,
  address,
}: {
  entry: AbiItem
  network: Network
  address: string
}) => {
  let name = entry.name || '<unknown event>'
  let inputs = entry.inputs || []
  const typeSig = `${name}(${inputs.map((i) => i.type).join(',')})`
  return (
    <p className="truncate hover:underline">
      <a
        href={`https://${
          config[network].scanDomain
        }/txs?ea=${address}&topic0=${Web3.utils.soliditySha3(typeSig)}`}
      >
        {name}
      </a>
    </p>
  )
}

const ReadContract = ({
  providerURL,
  address,
  abi,
}: {
  providerURL: string
  address: string
  abi: AbiItem[]
}) => {
  const [blockNumber, setBlockNumber] = useState<number | undefined>(undefined)
  return (
    <div>
      <p className="mt-5 text-purple-600">Read contract</p>
      <details className="px-2">
        <summary>block number</summary>
        <input
          type="number"
          className="rounded-md border p-1"
          value={blockNumber}
          placeholder="latest"
          onChange={(e) => setBlockNumber(parseInt(e.target.value))}
        />
      </details>
      <div>
        {abi
          .filter((e) => e.type === 'function' && e.stateMutability === 'view')
          .map((e, i) => (
            <ReadMethod
              key={i}
              abi={abi}
              entry={e}
              providerURL={providerURL!}
              address={address}
              blockNumber={blockNumber}
            />
          ))}
      </div>
    </div>
  )
}

const ReadMethod = ({
  abi,
  entry,
  providerURL,
  address,
  blockNumber,
}: {
  abi: AbiItem[]
  entry: AbiItem
  providerURL: string
  address: string
  blockNumber: number | undefined
}) => {
  let name = entry.name || '<unknown function>'
  let inputs = entry.inputs || []
  const web3 = new Web3(providerURL)
  const contract = new web3.eth.Contract(abi, address)
  if (blockNumber) {
    contract.defaultBlock = blockNumber
  }
  const typeSig = `${name}(${inputs.map((i) => i.type).join(',')})`
  const functionSelector = web3.utils.keccak256(typeSig).slice(0, 10)
  const fn = contract.methods[functionSelector]
  const [args, setArgs] = useState<(string | null)[]>(
    Array(inputs.length).fill(null)
  )
  const [result, setResult] = useState<Result<any> | null>(null)
  const [loading, setLoading] = useState(false)

  async function rpc() {
    try {
      setLoading(true)
      const res = await fn.apply(null, args).call()
      setResult({ data: res })
    } catch (error: any) {
      setResult({ error: { message: error.message } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="my-2 rounded-md border">
      <div className="flex justify-between bg-purple-100 p-2">
        <div>{name}</div>
        <button
          className="rounded border-purple-600 bg-white px-1"
          onClick={rpc}
        >
          Query
        </button>
      </div>

      {inputs.map((input, i) => (
        <div className="space-y-2 p-2">
          <div>
            {input.name || '<input>'} ({input.type})
          </div>
          <input
            name={`${name}-${input.name}-${i}`}
            type="text"
            className="w-full rounded-md border p-1"
            value={args[i] || ''}
            onChange={(e) => {
              setArgs((oldArgs) => {
                let newArgs = [...oldArgs]
                newArgs[i] = e.target.value
                return newArgs
              })
            }}
          />
        </div>
      ))}

      {loading ? (
        <p className="p-2">loading...</p>
      ) : !result ? (
        <></>
      ) : result?.data ? (
        <p className="p-2 text-purple-500">{result?.data}</p>
      ) : (
        <p className="p-2 text-red-600">{result?.error?.message}</p>
      )}
    </div>
  )
}

const Answer = ({
  loading,
  network,
  address,
  result,
}: {
  loading: boolean
  network: Network | null
  address: string
  result: Result<GetContractData> | null
}) => {
  if (!network && !address) {
    return <p className="text-center">👆 Try it</p>
  }
  if (network === null) {
    return <p className="text-center">🤔 Choose a network</p>
  }
  if (address === '') {
    return <p className="text-center">🤔 Paste an address</p>
  }
  if (!validateAddress(address)) {
    return <p className="text-center">🤔 Invalid address</p>
  }
  if (loading) {
    return <p className="text-center">⏳ loading...</p>
  }
  if (!result) {
    return <p className="text-center">❌ no data</p>
  }
  if (result.error) {
    return <p className="text-center">❌ {result.error.message}</p>
  }
  const abi: AbiItem[] = JSON.parse(result.data.ABI)
  let providerURL: string | null = null
  switch (network) {
    case 'ethereum':
      providerURL = `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
      break
    case 'polygon':
      providerURL = `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
      break
    case 'optimism':
      providerURL = `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
      break
    case 'arbitrum':
      providerURL = `https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
      break
    case 'aurora':
      providerURL = `https://aurora-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
      break
    default:
  }

  return (
    <div>
      <div className="grid grid-cols-3">
        <div>
          <p className="text-purple-600">Name</p>
          <p className="truncate">{result.data.ContractName}</p>
        </div>
        <div>
          <p className="text-purple-600">Start Block</p>
          <p>{result.data.StartBlock}</p>
        </div>
        <div>
          <p className="text-purple-600">Links</p>
          <div>
            <Link
              className="hover:underline"
              href={{
                pathname: '/code',
                query: { network, address, codeType: 'ABI' },
              }}
            >
              <a>ABI</a>
            </Link>
            {' | '}
            <Link
              className="hover:underline"
              href={{
                pathname: '/code',
                query: { network, address, codeType: 'SourceCode' },
              }}
            >
              <a>Code</a>
            </Link>
            {' | '}
            <a
              className="hover:underline"
              href={`https://${config[network].scanDomain}/address/${address}`}
            >
              Explorer
            </a>
          </div>
        </div>
      </div>
      <p className="mt-5 text-purple-600">
        Events (click to view transactions)
      </p>
      <div className="grid grid-cols-3 gap-1 text-left">
        {abi
          .filter((e) => e.type === 'event')
          .map((e, i) => (
            <AbiEvent key={i} entry={e} network={network} address={address} />
          ))}
      </div>
      {providerURL && (
        <ReadContract providerURL={providerURL} address={address} abi={abi} />
      )}
    </div>
  )
}

const Home: NextPage = () => {
  // autofocus input, see https://reactjs.org/docs/hooks-reference.html#useref
  const inputElement = React.useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [])

  const [network, setNetwork] = useQueryState('network')
  const [address, setAddress] = useQueryState('address')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result<GetContractData> | null>(null)

  async function fetchData() {
    setLoading(true)
    try {
      const { data } = await axios.get('api/contract', {
        params: {
          network,
          address,
        },
      })
      setResult(data)
    } catch (error: any) {
      setResult(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (network && address && validateAddress(address)) {
      fetchData()
    }
  }, [address, network])

  function handleAddressChange(event: React.FormEvent<HTMLInputElement>) {
    setAddress(event.currentTarget.value.trim().toLowerCase())
  }

  return (
    <div className="flex min-h-screen flex-col items-center font-mono">
      <Head>
        <title>miniscan</title>
        <link rel="icon" href="/favicon.ico" />
        <script
          data-token="VLESW6URT5L5"
          async
          src="https://cdn.splitbee.io/sb.js"
        ></script>
      </Head>

      <main className="flex w-full flex-1 items-center sm:w-4/5 lg:w-1/2">
        <div className="w-full">
          <div className=" text-center">
            <p className="my-5 text-3xl font-bold text-purple-600">
              🔍 miniscan: a simple contract explorer
            </p>
            <p className="">
              📚 Examples:{' '}
              <a
                href="/?address=0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f&network=ethereum"
                className="underline"
              >
                UniswapV2Factory
              </a>
              {' | '}
              <a
                href="/?address=0x59728544b08ab483533076417fbbb2fd0b17ce3a&network=ethereum"
                className="underline"
              >
                LooksRareExchange
              </a>
              {' | '}
              <a
                href="/?address=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&network=ethereum"
                className="underline"
              >
                WETH
              </a>
            </p>
          </div>
          <Select
            placeholder={'Select network'}
            className="basic-single my-5 text-center"
            classNamePrefix="select"
            name="networks"
            value={networkOptions.find((o) => o.value === network)}
            options={networkOptions}
            onChange={(selected) => {
              if (selected) {
                setNetwork(selected.value)
              }
            }}
          />
          <input
            type="text"
            className="form-control relative my-4 block w-full min-w-0 flex-auto rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-center text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
            placeholder="contract address"
            aria-label="Search"
            aria-describedby="button-addon2"
            value={address || ''}
            onChange={handleAddressChange}
            ref={inputElement}
          />
          <div className="text-md my-4">
            <Answer
              loading={loading}
              network={network as Network}
              address={address || ''}
              result={result}
            />
          </div>
        </div>
      </main>

      <footer className="flex h-20 w-full flex-col items-center justify-center border-t">
        <div>
          by{' '}
          <a className="underline" href="https://twitter.com/_0xbe1">
            0xbe1
          </a>{' '}
          |{' '}
          <a className="underline" href="https://github.com/0xbe1/miniscan">
            Code
          </a>{' '}
          <a className="underline" href="https://discord.gg/u5KUjNZ8wy">
            Community
          </a>{' '}
          | Powered by Etherscan
        </div>
        <div>
          <a className="text-purple-600 underline" href="https://miniscan.xyz">
            miniscan.xyz
          </a>{' '}
          |{' '}
          <a className="underline" href="https://theybuidl.xyz">
            theybuidl.xyz
          </a>{' '}
          |{' '}
          <a className="underline" href="https://okgraph.xyz">
            okgraph.xyz
          </a>{' '}
          |{' '}
          <a className="underline" href="https://name3.org">
            name3.org
          </a>
        </div>
      </footer>
    </div>
  )
}

export default Home
