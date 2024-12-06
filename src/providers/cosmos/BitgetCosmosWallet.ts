import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'

export class BitgetCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).bitkeep?.keplr
    if (!provider) {
      throw new Error('Bitget Wallet extension not found')
    }
    super(option, provider)
  }
}
