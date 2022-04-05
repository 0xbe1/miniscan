# startblock

The goal is to locate the start block of an Ethereum contract programmatically.

## Background

Start block accelerates subgraph indexing by a lot.

Currently, subgraph developers manually follow the steps [here](https://thegraph.com/docs/en/developer/create-subgraph-hosted/#start-blocks)
in order to locate the start block. The process is boring and error-prone.

We can do this in code instead. As deliverables, we host both an API endpoint and a UI for users to access the ability.

(Optional) What if we can integrate this functionality into The Graph CLI?
