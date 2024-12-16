import { CosmosProvider } from './CosmosProvider'
import { getWindow, ProviderOption } from '../../WalletProvider'
import { TomoWallet } from '../../types'
import leapIcon from '../../icons/leap.jpg'

export class LeapCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const provider = getWindow(option).leap
    if (!provider) {
      throw new Error('OKX Wallet extension not found')
    }
    super(option, provider)
  }
  getWalletProviderName(): string {
    return leapCosmosWalletOption.name
  }
  getWalletProviderIcon(): string {
    return leapCosmosWalletOption.img
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
