import { CosmosProvider } from './CosmosProvider'

export class StationCosmosWallet extends CosmosProvider {
  constructor(chains: any[]) {
    // @ts-ignore
    const provider = window.station?.keplr
    if (!provider) {
      throw new Error('Station Wallet extension not found')
    }
    super(chains, provider)
  }
}
