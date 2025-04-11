import { ProviderOption, TomoCosmosInjected } from '../../../WalletProvider'
import { TomoWallet } from '../../../types'
import keystoneIcon from '../../../icons/keystone.svg'
import { CosmosProvider } from '../CosmosProvider'
import { KeystoneKeplr } from './KeystoneKeplr'

export class KeystoneCosmosWallet extends CosmosProvider {
  constructor(option: ProviderOption) {
    const provider = new KeystoneKeplr(option.chains) as TomoCosmosInjected
    super(option, provider)
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(keystoneCosmosWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(keystoneCosmosWalletOption.img)
  }
}

export const keystoneCosmosWalletOption = {
  id: 'cosmos_keystone',
  img: keystoneIcon,
  name: 'Keystone',
  chainType: 'cosmos',
  connectProvider: KeystoneCosmosWallet,
  type: 'qrcode'
} as TomoWallet
