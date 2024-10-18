import { BTCProvider } from './BTCProvider'

export const tomoProvider = 'tomo_btc'

export class TomoBTCWallet extends BTCProvider {
  constructor() {
    // @ts-ignore
    const bitcoinNetworkProvider = window[tomoProvider]
    // check whether there is Tomo extension
    if (!bitcoinNetworkProvider) {
      throw new Error('Tomo Wallet extension not found')
    }
    super(bitcoinNetworkProvider)
  }

  connectWallet = async (): Promise<this> => {
    const workingVersion = '1.2.0'
    if (!this.bitcoinNetworkProvider) {
      throw new Error('Tomo Wallet extension not found')
    }
    if (this.bitcoinNetworkProvider.getVersion) {
      const version = await this.bitcoinNetworkProvider.getVersion()
      if (version < workingVersion) {
        throw new Error('Please update Tomo Wallet to the latest version')
      }
    }

    let addresses = null
    let pubKey = null
    try {
      // this will not throw an error even if user has no BTC Signet enabled
      addresses = await this.bitcoinNetworkProvider.connectWallet()
      pubKey = await this.bitcoinNetworkProvider.getPublicKey()
      if (!addresses || addresses.length === 0 || !pubKey) {
        throw new Error('BTC is not enabled in Tomo Wallet')
      }
    } catch (error) {
      throw new Error('BTC is not enabled in Tomo Wallet')
    }

    return this
  }

  getWalletProviderName = async (): Promise<string> => {
    return 'Tomo'
  }

  getBalance = async (): Promise<number> => {
    const result = await this.bitcoinNetworkProvider.getBalance()
    return result
  }

  pushTx = async (txHex: string): Promise<string> => {
    return await this.bitcoinNetworkProvider.pushTx(txHex)
  }
}
