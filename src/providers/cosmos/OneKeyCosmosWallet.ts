import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'

export class OneKeyCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).$onekey?.cosmos
    if (!provider) {
      throw new Error('OneKey Wallet extension not found')
    }
    super(option, provider)
  }
}
