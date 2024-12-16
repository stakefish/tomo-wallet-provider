import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import okxIcon from '../../icons/okx_wallet.svg'

export class OKXCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).okxwallet?.keplr
    if (!provider) {
      throw new Error('OKX Wallet extension not found')
    }
    super(option, provider)
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(okxCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(okxCosmosWalletOption.img)
  }
}

export const okxCosmosWalletOption = {
  id: 'cosmos_okx',
  img: okxIcon,
  name: 'OKX',
  chainType: 'cosmos',
  connectProvider: OKXCosmosWallet,
  type: 'extension'
} as TomoWallet
