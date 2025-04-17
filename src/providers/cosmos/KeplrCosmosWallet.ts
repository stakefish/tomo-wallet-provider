import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import keplrIcon from '../../icons/keplr_wallet.png'
import { Keplr } from '@keplr-wallet/provider-extension'

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
  async init() {
    const keplr = await Keplr.getKeplr()
    if (!keplr) {
      throw new Error('Keplr Wallet extension not found')
    }
    this.provider = keplr
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(keplrCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(keplrCosmosWalletOption.img)
  }

  on(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      window.addEventListener('keplr_keystorechange', callBack)
    }
  }
  off(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      window.removeEventListener('keplr_keystorechange', callBack)
    }
  }
}

export const keplrCosmosWalletOption = {
  id: 'cosmos_keplr',
  img: keplrIcon,
  name: 'Keplr',
  chainType: 'cosmos',
  connectProvider: KeplrCosmosWallet,
  type: 'extension'
} as TomoWallet
