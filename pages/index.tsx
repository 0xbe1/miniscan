import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Select from 'react-select'

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
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'bsc', label: 'BSC' },
]

export type Network = 'ethereum' | 'bsc'

function validateAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

const Answer = ({
  isEmptyInput,
  isValidInput,
  loading,
  result,
}: {
  isEmptyInput: boolean
  isValidInput: boolean
  loading: boolean
  result: Result | null
}) => {
  if (isEmptyInput) {
    return <p>Try it 👆</p>
  }
  if (!isValidInput) {
    return <p>Invalid input 🤔</p>
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
  return <p className="text-purple-600">{result.data.blockNumber}</p>
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
  const isEmptyInput: boolean = !network && !address
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
        <title>startblock</title>
        <link rel="icon" href="/favicon.ico" />
        <script
          src="https://cdn.usefathom.com/script.js"
          data-site="USEASVFB"
          defer
        ></script>
      </Head>

      <main className="flex w-full flex-1 items-center sm:w-2/3 lg:w-1/3">
        <div className="w-full">
          <div className=" text-center">
            <p className="bg-gradient-to-tr from-purple-600 to-blue-600 bg-clip-text text-6xl font-bold text-transparent">
              startblock
            </p>
            <p className="mt-5 text-xl">
              Find a contract's startblock{' '}
              <span className="font-bold text-purple-600">easily</span>{' '}
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
            className="form-control relative my-7 block w-full min-w-0 flex-auto rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-center text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
            placeholder="contract address"
            aria-label="Search"
            aria-describedby="button-addon2"
            value={address}
            onChange={handleAddressChange}
            ref={inputElement}
          />
          <div className="mt-1 text-center text-xl">
            <Answer
              isEmptyInput={isEmptyInput}
              isValidInput={isValidInput}
              loading={loading}
              result={result}
            />
          </div>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        By&nbsp;
        <a className="text-purple-600" href="https://github.com/0xbe1">
          @0xbe1
        </a>
        &nbsp;
        <a href="https://discord.gg/vN2dTXeNsc">
          <img src="discord.svg" alt="Discord" className="h-6" />
        </a>
        &nbsp;
        <a href="https://github.com/0xbe1/startblock">
          <img src="github.svg" alt="GitHub" className="h-6" />
        </a>
      </footer>
    </div>
  )
}

export default Home
