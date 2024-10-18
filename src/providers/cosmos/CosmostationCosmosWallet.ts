import { CosmosProvider } from './CosmosProvider'

export class CosmostationCosmosWallet extends CosmosProvider {
  constructor(chains: any[]) {
    // @ts-ignore
    const provider = window.cosmostation?.providers?.keplr
    if (!provider) {
      throw new Error('Cosmostation Wallet extension not found')
    }
    super(chains, provider)
  }
}
