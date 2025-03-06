import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import cosmostationIcon from '../../icons/cosmostation.ico'

export class CosmostationCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).cosmostation?.providers?.keplr
    if (!provider) {
      throw new Error('Cosmostation Wallet extension not found')
    }
    super(option, provider)
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(cosmostationCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(cosmostationCosmosWalletOption.img)
  }
  on(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      window.addEventListener('cosmostation_keystorechange', callBack)
    }
  }
  off(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      window.removeEventListener('cosmostation_keystorechange', callBack)
    }
  }
}

export const cosmostationCosmosWalletOption = {
  id: 'cosmos_cosmostation',
  img: cosmostationIcon,
  name: 'Cosmostation',
  chainType: 'cosmos',
  connectProvider: CosmostationCosmosWallet,
  type: 'extension'
} as TomoWallet
