import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Select from 'react-select'
import Tweet from './tweet'

export type Result = {
  data: {
    blockNumber: number
  }
  error?: {
    msg: string
  }
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
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'fantom', label: 'Fantom' },
  { value: 'gnosis', label: 'Gnosis' },
  { value: 'optimism', label: 'Optimism' },
  { value: 'polygon', label: 'Polygon' },
]

export type Network =
  | 'arbitrum'
  | 'aurora'
  | 'avalanche'
  | 'bsc'
  | 'celo'
  | 'ethereum'
  | 'fantom'
  | 'gnosis'
  | 'optimism'
  | 'polygon'

function validateAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
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
  result: Result | null
}) => {
  if (!network && !address) {
    return <p>Try it 👆</p>
  }
  if (network === null) {
    return <p>Choose a network 🤔</p>
  }
  if (address === '') {
    return <p>Paste an address 🤔</p>
  }
  if (!validateAddress(address)) {
    return <p>Invalid address 🤔</p>
  }
  if (loading) {
    return <p>loading... ⏳</p>
  }
  if (!result) {
    return <p>no data ❌</p>
  }
  if (result.error) {
    return <p>{result.error.msg} ❌</p>
  }
  return (
    <div className="flex flex-row justify-around text-purple-600">
      <div className="my-auto">Start Block #{result.data.blockNumber}</div>
      <button
        className="rounded-lg border-2 border-purple-300 p-2 hover:border-transparent hover:bg-purple-600 hover:text-white"
        onClick={() =>
          window.open(
            `/api/abi?network=${network}&address=${address}`,
            '_blank'
          )
        }
      >
        View ABI
      </button>

      <button
        className="rounded-lg border-2 border-purple-300 p-2 hover:border-transparent hover:bg-purple-600 hover:text-white"
        onClick={() =>
          window.open(
            `/api/sourcecode?network=${network}&address=${address}`,
            '_blank'
          )
        }
      >
        View Code
      </button>
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

  const [network, setNetwork] = useState<Network | null>(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  // derived states
  const isValidInput: boolean = network !== null && validateAddress(address)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data } = await axios.get('api/startblock', {
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
    if (isValidInput) {
      fetchData()
    }
  }, [address, network])

  function handleAddressChange(event: React.FormEvent<HTMLInputElement>) {
    setAddress(event.currentTarget.value)
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
            <p className="bg-gradient-to-tr from-purple-600 to-blue-600 bg-clip-text text-6xl font-bold text-transparent">
              miniscan
            </p>
            <p className="mt-5 text-xl">
              Understand contracts{' '}
              <span className="font-bold text-purple-600">easily</span>
            </p>
          </div>
          <Select
            placeholder={'Select network'}
            className="basic-single my-5 text-center"
            classNamePrefix="select"
            name="networks"
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
            value={address}
            onChange={handleAddressChange}
            ref={inputElement}
          />
          <div className="my-4 text-center text-xl">
            <Answer
              loading={loading}
              network={network}
              address={address}
              result={result}
            />
          </div>
          <Tweet
            name="nader dabit (🧱, 🚀) | sha.eth | nader.sol"
            username="dabit3"
            tweetUrl="https://twitter.com/dabit3/status/1512089488847257600"
            authorUrl="https://twitter.com/dabit3"
            profileImageUrl="https://pbs.twimg.com/profile_images/1496581535914414082/LB6_2C6f_400x400.jpg"
          />
        </div>
      </main>

      <footer className="flex h-16 w-full items-center justify-center border-t">
        By&nbsp;
        <a className="text-purple-600" href="https://github.com/0xbe1">
          @0xbe1
        </a>
        &nbsp;
        <a href="https://github.com/0xbe1/miniscan">
          <img src="github.svg" alt="GitHub" className="h-6" />
        </a>
        &nbsp;|&nbsp;Questions?&nbsp;
        <a href="https://discord.gg/u5KUjNZ8wy">
          <img src="discord.svg" alt="Discord" className="h-6" />
        </a>
        &nbsp;
        <a href="https://twitter.com/_0xbe1/status/1511638106554134530">
          <img src="twitter.svg" alt="Twitter" className="h-6" />
        </a>
        &nbsp;
        <a href="https://www.reddit.com/r/thegraph/comments/txi4c6/announcing_startblock_find_a_contracts_startblock/">
          <img src="reddit.svg" alt="Reddit" className="h-6" />
        </a>
      </footer>
    </div>
  )
}

export default Home
