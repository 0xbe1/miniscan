import React from 'react'
import Image from 'next/image'

type TweetProps = {
  name: string
  username: string
  tweetUrl: string
  authorUrl: string
  profileImageUrl: string
}

// Reference: https://github.com/leerob/leerob.io/pull/257
const Tweet = (props: TweetProps) => {
  return (
    <div className="rounded-lg border border-gray-200 px-6 py-4 font-sans">
      <div className="flex items-center">
        <a
          className="flex h-12 w-12"
          href={props.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt={props.username}
            height={48}
            width={48}
            src={props.profileImageUrl}
            className="rounded-full"
          />
        </a>
        <a
          href={props.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 flex flex-col"
        >
          <span
            className="flex items-center font-bold leading-5 text-gray-900 dark:text-gray-100"
            title={props.name}
          >
            {props.name}
          </span>
          <span className="text-gray-500" title={`@${props.username}`}>
            @{props.username}
          </span>
        </a>
        <a
          className="ml-auto"
          href={props.tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            viewBox="328 355 335 276"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 630, 425    A 195, 195 0 0 1 331, 600    A 142, 142 0 0 0 428, 570    A  70,  70 0 0 1 370, 523    A  70,  70 0 0 0 401, 521    A  70,  70 0 0 1 344, 455    A  70,  70 0 0 0 372, 460    A  70,  70 0 0 1 354, 370    A 195, 195 0 0 0 495, 442    A  67,  67 0 0 1 611, 380    A 117, 117 0 0 0 654, 363    A  65,  65 0 0 1 623, 401    A 117, 117 0 0 0 662, 390    A  65,  65 0 0 1 630, 425    Z"
              style={{ fill: '#3BA9EE' }}
            />
          </svg>
        </a>
      </div>
      <div className="mt-4 mb-1 whitespace-pre-wrap text-lg leading-normal text-gray-700">
        A great tool to have handy when building subgraphs to quickly get the
        start block for any smart contract deployed to many of the main networks
        including{' '}
        <a className="text-blue-500" href="https://twitter.com/0xPolygon">
          @0xPolygon
        </a>
        ,{' '}
        <a className="text-blue-500" href="https://twitter.com/ethereum">
          @ethereum
        </a>
        , and{' '}
        <a className="text-blue-500" href="https://twitter.com/arbitrum">
          @Arbitrum
        </a>
        , and{' '}
        <a className="text-blue-500" href="https://twitter.com/optimismPBC">
          @optimismPBC
        </a>{' '}
        ⚡️
        <br></br>
        <br></br>
        try it out:
        <br></br>
        Ethereum
        <br></br>
        0x25ed58c027921E14D86380eA2646E3a1B5C55A8b
      </div>
    </div>
  )
}

export default Tweet
