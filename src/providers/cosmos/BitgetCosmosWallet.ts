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
}

export const bitgetCosmosWalletOption = {
  id: 'cosmos_bitget',
  img: bitgetIcon,
  name: 'Bitget Wallet',
  chainType: 'cosmos',
  connectProvider: BitgetCosmosWallet,
  type: 'extension'
} as TomoWallet
