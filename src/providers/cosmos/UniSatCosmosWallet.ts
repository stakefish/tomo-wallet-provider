import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import unisatIcon from '../../icons/unisat_wallet.svg'

export class UniSatCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option)?.unisat_wallet?.keplr
    if (!provider) {
      throw new Error('UniSat Wallet extension not found')
    }
    super(option, provider)
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(uniSatCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(uniSatCosmosWalletOption.img)
  }
  on(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      // @ts-ignore
      const unisat = getWindow(this.option)?.unisat
      unisat?.on?.('accountsChanged', callBack)
    }
  }
  off(eventName: string, callBack: () => void) {
    if (eventName === 'accountChanged') {
      // @ts-ignore
      const unisat = getWindow(this.option)?.unisat
      unisat?.on?.('accountsChanged', callBack)
    }
  }
}

export const uniSatCosmosWalletOption = {
  id: 'cosmos_unisat',
  img: unisatIcon,
  name: 'Unisat',
  chainType: 'cosmos',
  connectProvider: UniSatCosmosWallet,
  type: 'extension'
} as TomoWallet
