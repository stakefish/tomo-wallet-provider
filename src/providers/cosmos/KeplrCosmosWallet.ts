import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'

const providerName = 'keplr'
export class KeplrCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option)[providerName]
    // check whether there is Keplr extension
    if (!provider) {
      throw new Error('Keplr Wallet extension not found')
    }
    super(option, provider)
  }
}
