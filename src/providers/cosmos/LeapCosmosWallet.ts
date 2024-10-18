import { CosmosProvider } from './CosmosProvider'

export class LeapCosmosWallet extends CosmosProvider {
  constructor(chains: any[]) {
    // @ts-ignore
    const provider = window.leap
    if (!provider) {
      throw new Error('OKX Wallet extension not found')
    }
    super(chains, provider)
  }
}
