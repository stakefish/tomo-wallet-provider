import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'

export class StationCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).station?.keplr
    if (!provider) {
      throw new Error('Station Wallet extension not found')
    }
    super(option, provider)
  }
}
