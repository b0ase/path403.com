bars [![](https://protocol.pow20.io/~gitbook/image?url=https%3A%2F%2F1287186087-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Ffrrb0ZJ2yK9in7A1AcOK%252Ficon%252FW0CMX8muHahhMPc4fcAq%252FScreen%2520Shot%25202024-02-07%2520at%25204.27.48%2520PM.png%3Falt%3Dmedia%26token%3D1373e009-2858-4eca-9a57-28a331102aab&width=32&dpr=3&quality=100&sign=8eb485ca&sv=2)![](https://protocol.pow20.io/~gitbook/image?url=https%3A%2F%2F1287186087-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Ffrrb0ZJ2yK9in7A1AcOK%252Ficon%252FW0CMX8muHahhMPc4fcAq%252FScreen%2520Shot%25202024-02-07%2520at%25204.27.48%2520PM.png%3Falt%3Dmedia%26token%3D1373e009-2858-4eca-9a57-28a331102aab&width=32&dpr=3&quality=100&sign=8eb485ca&sv=2)\\
POW-20 Protocol](https://protocol.pow20.io/)

search

circle-xmark

`⌘Ctrl`  `k`

[![](https://protocol.pow20.io/~gitbook/image?url=https%3A%2F%2F1287186087-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Ffrrb0ZJ2yK9in7A1AcOK%252Ficon%252FW0CMX8muHahhMPc4fcAq%252FScreen%2520Shot%25202024-02-07%2520at%25204.27.48%2520PM.png%3Falt%3Dmedia%26token%3D1373e009-2858-4eca-9a57-28a331102aab&width=32&dpr=3&quality=100&sign=8eb485ca&sv=2)![](https://protocol.pow20.io/~gitbook/image?url=https%3A%2F%2F1287186087-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Ffrrb0ZJ2yK9in7A1AcOK%252Ficon%252FW0CMX8muHahhMPc4fcAq%252FScreen%2520Shot%25202024-02-07%2520at%25204.27.48%2520PM.png%3Falt%3Dmedia%26token%3D1373e009-2858-4eca-9a57-28a331102aab&width=32&dpr=3&quality=100&sign=8eb485ca&sv=2)\\
POW-20 Protocol](https://protocol.pow20.io/)

- [🔥POW-20 Protocol](https://protocol.pow20.io/)
- [🔗What is pow20.io?](https://protocol.pow20.io/what-is-pow20.io)

chevron-upchevron-down

[gitbookPowered by GitBook](https://www.gitbook.com/?utm_source=content&utm_medium=trademark&utm_campaign=frrb0ZJ2yK9in7A1AcOK)

xmark

block-quoteOn this pagechevron-down

- [Introduction](https://protocol.pow20.io/#introduction)
- [Deploy](https://protocol.pow20.io/#deploy)
- [Mint](https://protocol.pow20.io/#mint)
- [Transfer](https://protocol.pow20.io/#transfer)
- [Examples](https://protocol.pow20.io/#examples)

copyCopychevron-down

# 🔥POW-20 Protocol

POW-20 protocol is an extension of BRC-20 protocol that introduces and requires proof-of-work (PoW) to mint and produce new tokens.

## [hashtag](https://protocol.pow20.io/\#introduction)    Introduction

Proof-of-Work is the backbone of Bitcoin (BTC) and other PoW chains like Litecoin (LTC), Doge (DOGE), Bitcoin Cash (BCH), Bitcoin SV (BSV), etc. However, derivative assets (tokens/NFTs) like [BRC-20arrow-up-right](https://domo-2.gitbook.io/brc-20-experiment/) that run on these base layers have traditionally been issued or distributed through means other than PoW. While [Atomicalsarrow-up-right](https://docs.atomicals.xyz/) recently enabled a version of PoW token mining, it does so at a cost, namely understandability for the average person and a learning curve to get started. It's fairly complex if you're not a dev. It also introduces challenges for exchanges and indexers that may wish to implement them.

What is needed is something simple that "extends" what we already have with [BRC-20arrow-up-right](https://domo-2.gitbook.io/brc-20-experiment/), making it easy for users, exchanges, and indexers to get started or implement with a few lines of code.

The protocol is straight forward and should look familiar.

### [hashtag](https://protocol.pow20.io/\#deploy)    Deploy

Copy

```
{
  "p": "pow-20",
  "op": "deploy",
  "tick": "DOTI",
  "max": "21000000",
  "lim": "1000",
  "difficulty": "5",
  "startBlock": "875000"
  "dec": "8" // max 15
  "icon": "534cede12f90729d961dbdaf7dc889e9ac6567fd43759097567bca2f2791dcd8i0"
}
```

**New Fields**

- **difficulty:** The number of leading zeros required in the double sha256 hash of the solution

- **startBlock:** Any future block number

- **icon (optional)**: a reference inscriptionId or link to the icon


### [hashtag](https://protocol.pow20.io/\#mint)    Mint

Copy

```
{
  "p": "pow-20",
  "op": "mint",
  "tick": "DOTI",
  "amt": "1000",
  "solution": "<TICK>:<BTC_ADDRESS>:<START_BLOCK_HEADER>:<NONCE>"
}
```

**New Fields**

- **solution:** A unique string that is **double** sha256  hashed to meet the difficulty specified in the deploy inscription


A solution is composed of 4 parts delimited by a colon:

1. **TICK**\- The ticker symbol

2. **BTC\_ADDRESS**\- The BTC ordinal address that the inscription is inscribed to (to prevent mempool sniping)

3. **START\_BLOCK\_HEADER** \- The future block header/hash of the `startBlock` specified in the deploy inscription (to prevent pre-mines)

4. **NONCE**\- A random nonce


### [hashtag](https://protocol.pow20.io/\#transfer)    Transfer

Copy

```
{
  "p": "pow-20",
  "op": "transfer",
  "tick": "DOTI",
  "amt": "500"
}
```

circle-info

### [hashtag](https://protocol.pow20.io/\#new-indexer-rules)    New Indexer Rules

1. Is the address the same address found in the inscription? Must be `true`

2. Does the solution contain the correct `START_BLOCK_HEADER` header for the `startBlock` found in the deploy inscription? Must be `true`

3. Does the double sha256 hash of the solution meet the `difficulty` found in the deploy inscription? Must be `true`

4. Has the solution been seen before? Must be `false`


### [hashtag](https://protocol.pow20.io/\#examples)    Examples

**Valid Deploy:**

Copy

```
{
  "p": "pow-20",
  "op": "deploy",
  "tick": "TEST",
  "max": "21000000",
  "dec": "8", // max 15
  "lim": "1000",
  "difficulty": "3",
  "startBlock": "826728"
}
```

**Valid Mint:**

Copy

```
{
  "p": "pow-20",
  "op": "mint",
  "tick": "TEST",
  "amt": "1000",
  "solution": "TEST:bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297:00000000000000000003b29163d794f519b3395338bd20420aa3772c9bbf3434:5390"
}
```

The double sha256 hash of the above solution produces the following hash which meets the example deployment difficulty requirement of 3:

Copy

```
00050f8fa258111ce0c040baaf5b97339cc241dab85587c3e59fb5d864e53f7f
```

**Valid Transfer:**

Copy

```
{
  "p": "pow-20",
  "op": "transfer",
  "tick": "TEST",
  "amt": "250",
}
```

**Invalid Mint:**

Copy

```
{
  "p": "pow-20",
  "op": "mint",
  "tick": "TEST",
  "amt": "1000",
  "solution": "TEST:bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297:00000000000000000003b29163d794f519b3395338bd20420aa3772c9bbf3434:1258"
}
```

The double sha256 hash of the above solution produces the following hash which does _**NOT**_ meet the deployment difficulty requirement and is invalid:

Copy

```
4edd19656a5f82c771f376a3db4d641cd6a58b09a4b1db530344977045b1515d
```

circle-info

NOTE: The above protocol applies to all layer-1 chains other than BSV which implements an [sCryptarrow-up-right](https://scrypt.io/) Hash-to-Mint (HTM) [smart-contractarrow-up-right](https://github.com/danwag06/htm-contract) for [BSV-20(v2)arrow-up-right](https://docs.1satordinals.com/bsv20#new-in-v2-tickerless-mode) token issuance based on provided proof-of-work.

[NextWhat is pow20.io?chevron-right](https://protocol.pow20.io/what-is-pow20.io)

Last updated 1 year ago