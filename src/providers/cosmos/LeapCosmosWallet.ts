import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'

export class LeapCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).leap
    if (!provider) {
      throw new Error('OKX Wallet extension not found')
    }
    super(option, provider)
  }
}
