import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import leapIcon from '../../icons/leap.png'

export class LeapCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).leap
    if (!provider) {
      throw new Error('OKX Wallet extension not found')
    }
    super(option, provider)
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(leapCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(leapCosmosWalletOption.img)
  }
  on(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      window.addEventListener('leap_keystorechange', callBack)
    }
  }
  off(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      window.removeEventListener('leap_keystorechange', callBack)
    }
  }
}

export const leapCosmosWalletOption = {
  id: 'cosmos_leap',
  img: leapIcon,
  name: 'Leap',
  chainType: 'cosmos',
  connectProvider: LeapCosmosWallet,
  type: 'extension'
} as TomoWallet
