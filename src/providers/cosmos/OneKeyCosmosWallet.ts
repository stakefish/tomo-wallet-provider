import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import onekeyIcon from '../../icons/onekey.svg'

export class OneKeyCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).$onekey?.cosmos
    if (!provider) {
      throw new Error('OneKey Wallet extension not found')
    }
    super(option, provider)
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(oneKeyCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(oneKeyCosmosWalletOption.img)
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

export const oneKeyCosmosWalletOption = {
  id: 'cosmos_onekey',
  img: onekeyIcon,
  name: 'OneKey',
  chainType: 'cosmos',
  connectProvider: OneKeyCosmosWallet,
  type: 'extension'
} as TomoWallet
