import { BTCProvider } from './BTCProvider'
import { getWindow, Network, ProviderOption } from '../../WalletProvider'
import cosmostationIcon from '../../icons/cosmostation.ico'
import { TomoWallet } from '../../types'
export class CosmostationBTCWallet extends BTCProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const bitcoinNetworkProvider = getWindow(option).cosmostation?.bitcoin
    // check whether there is Tomo extension
    if (!bitcoinNetworkProvider) {
      throw new Error('Cosmostation Wallet extension not found')
    }
    super(option, bitcoinNetworkProvider)
  }
  connectWallet = async (): Promise<this> => {
    if (!this.bitcoinNetworkProvider) {
      throw new Error('Cosmostation Wallet extension not found')
    }
    let addresses = null
    let pubKey = null
    try {
      // this will not throw an error even if user has no BTC Signet enabled
      // @ts-ignore
      addresses = await this.bitcoinNetworkProvider.connectWallet()
      pubKey = await this.bitcoinNetworkProvider.getPublicKey()
      if (!addresses || addresses.length === 0 || !pubKey) {
        throw new Error('BTC is not enabled in Cosmostation Wallet')
      }
      return this
    } catch (error) {
      throw new Error('BTC is not enabled in Cosmostation Wallet')
    }
  }
  getBalance = async (): Promise<number> => {
    // @ts-ignore
    const result = await this.bitcoinNetworkProvider.getBalance()
    return result
  }
  pushTx = async (txHex: string): Promise<string> => {
    // @ts-ignore
    return await this.bitcoinNetworkProvider.pushTx(txHex)
  }
  getNetwork = async (): Promise<Network> => {
    // @ts-ignore
    return await this.bitcoinNetworkProvider.getNetwork()
  }
  async switchNetwork(network: Network) {
    return await this.bitcoinNetworkProvider.switchNetwork(network)
  }
  async getPublicKeyHex(): Promise<string> {
    return await this.bitcoinNetworkProvider.getPublicKey()
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(cosmostationBTCWalletOption.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(cosmostationBTCWalletOption.img)
  }
}
export const cosmostationBTCWalletOption = {
  id: 'bitcoin_cosmostation',
  img: cosmostationIcon,
  name: 'Cosmostation',
  chainType: 'bitcoin',
  connectProvider: CosmostationBTCWallet,
  type: 'extension'
} as TomoWallet
