import { CosmosProvider } from './CosmosProvider'

export class OKXCosmosWallet extends CosmosProvider {
  constructor(chains: any[]) {
    // @ts-ignore
    const provider = window.okxwallet?.keplr
    if (!provider) {
      throw new Error('OKX Wallet extension not found')
    }
    super(chains, provider)
  }
}
