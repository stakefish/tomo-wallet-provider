import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'

export class OKXCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).okxwallet?.keplr
    if (!provider) {
      throw new Error('OKX Wallet extension not found')
    }
    super(option, provider)
  }
}
