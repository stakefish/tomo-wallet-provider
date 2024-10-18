import { CosmosProvider } from './CosmosProvider'

const providerName = 'keplr'
export class KeplrCosmosWallet extends CosmosProvider {
  constructor(chains: any[]) {
    // @ts-ignore
    const provider = window[providerName]
    // check whether there is Keplr extension
    if (!provider) {
      throw new Error('Keplr Wallet extension not found')
    }
    super(chains, provider)
  }
}
