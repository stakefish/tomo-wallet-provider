# tomo-wallet-provider

## Chain
```typescript
type TomoChain = {
  network: string
  backendUrls?: {
    rpcRrl?: string
    // only BTC
    mempoolUrl?: string
    inscriptionUrl?: string
  }
}
```
### inscriptionUrl
`GET ${inscriptionUrl}/openapi/bitcoin/inscriptions`

**request params**
```typescript
{
  address: string
  networkType: "MAINNET" | "SIGNET" | "TESTNET"
  cursor?: number
  size?: number
}
```
**response**
```typescript
{
  list: {
    output: string
    inscriptionId: string
    address: string
    offset: number
    outputValue: number
    location: string
    contentType: string
    contentLength: number
    inscriptionNumber: number
    timestamp: number
    genesisTransaction: string
  }[]
  total: number
}
```