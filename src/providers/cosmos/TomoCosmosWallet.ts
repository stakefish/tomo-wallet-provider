import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import tomoIcon from '../../icons/tomo.png'

const providerName = 'tomo_cosmos'
export class TomoCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option)[providerName]
    if (!provider) {
      throw new Error('Tomo Wallet extension not found')
    }
    super(option, provider)
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(tomoCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(tomoCosmosWalletOption.img)
  }

  on(eventName: string, callBack: () => void) {
    // @ts-ignore
    getWindow(this.option).tomo_btc?.on?.(eventName, callBack)
  }
  off(eventName: string, callBack: () => void): void {
    // @ts-ignore
    getWindow(this.option).tomo_btc?.off?.(eventName, callBack)
  }
}

export const tomoCosmosWalletOption = {
  id: 'cosmos_tomo',
  img: tomoIcon,
  name: 'Tomo',
  chainType: 'cosmos',
  connectProvider: TomoCosmosWallet,
  type: 'extension'
} as TomoWallet
