import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Select from 'react-select'
import web3 from 'web3'
import { useQueryState } from 'next-usequerystate'
import Tweet from '../components/tweet'
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

interface AbiEntry {
  name: string
  type: string
  inputs: Array<{
    indexed: boolean
    internalType: string
    name: string
    type: string
  }>
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
  entry: AbiEntry
  network: Network
  address: string
}) => {
  const { name, inputs } = entry
  const typeSig = `${name}(${inputs.map((i) => i.type).join(',')})`
  return (
    <p className="truncate hover:underline">
      <a
        href={`https://${
          config[network].scanDomain
        }/txs?ea=${address}&topic0=${web3.utils.soliditySha3(typeSig)}`}
      >
        {name}
      </a>
    </p>
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
  const abi: AbiEntry[] = JSON.parse(result.data.ABI)
  return (
    <div>
      <div className="grid grid-cols-3">
        <div>
          <p className="text-purple-600 truncate">Name</p>
          <p>{result.data.ContractName}</p>
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
      <p className="mt-5 text-purple-600">Events (click to view txs)</p>
      <div className="grid grid-cols-3 gap-1 text-left">
        {abi
          .filter((e) => e.type === 'event')
          .map((e, i) => (
            <AbiEvent key={i} entry={e} network={network} address={address} />
          ))}
      </div>
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
            <p className="my-5 text-6xl font-bold text-purple-600">miniscan</p>
            <p className="my-2 text-xl">Contract deep dive like a pro</p>
            <p className="text-md text-purple-600">
              Trusted by devs @{' '}
              <a className="underline" href="https://messari.io/">
                Messari
              </a>{' '}
              |{' '}
              <a className="underline" href="https://thegraph.com/">
                The Graph
              </a>{' '}
              |{' '}
              <a className="underline" href="https://simplefi.finance/">
                SimpleFi
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
          <Tweet
            name="nader dabit (🧱, 🚀) | sha.eth | nader.sol"
            username="dabit3"
            tweetUrl="https://twitter.com/dabit3/status/1512089488847257600"
            authorUrl="https://twitter.com/dabit3"
            profileImageUrl="https://pbs.twimg.com/profile_images/1527428692103860224/sqHT4Wl1_400x400.png"
          />
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
