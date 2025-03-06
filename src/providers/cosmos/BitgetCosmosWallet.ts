import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import bitgetIcon from '../../icons/bitget-wallet.png'

export class BitgetCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).bitkeep?.keplr
    if (!provider) {
      throw new Error('Bitget Wallet extension not found')
    }
    super(option, provider)
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(bitgetCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(bitgetCosmosWalletOption.img)
  }
  on(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      window.addEventListener('bitget_keystorechange', callBack)
    }
  }
  off(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      window.removeEventListener('bitget_keystorechange', callBack)
    }
  }
}

export const bitgetCosmosWalletOption = {
  id: 'cosmos_bitget',
  img: bitgetIcon,
  name: 'Bitget Wallet',
  chainType: 'cosmos',
  connectProvider: BitgetCosmosWallet,
  type: 'extension'
} as TomoWallet
