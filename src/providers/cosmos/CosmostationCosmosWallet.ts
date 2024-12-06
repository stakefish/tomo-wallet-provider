import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'

export class CosmostationCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).cosmostation?.providers?.keplr
    if (!provider) {
      throw new Error('Cosmostation Wallet extension not found')
    }
    super(option, provider)
  }
}
