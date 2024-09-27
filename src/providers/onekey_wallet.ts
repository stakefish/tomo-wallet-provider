import {
  Inscription,
  InscriptionResult,
  Network,
  WalletInfo,
  WalletProvider
} from '../wallet_provider'
import { parseUnits } from '../utils/parseUnits'

export const oneKeyProvider = '$onekey'

// Internal network names
const INTERNAL_NETWORK_NAMES = {
  [Network.MAINNET]: 'livenet',
  [Network.TESTNET]: 'testnet',
  [Network.SIGNET]: 'signet'
}

export class OneKeyWallet extends WalletProvider {
  constructor() {
    super()

    // check whether there is an OneKey extension
    if (!window[oneKeyProvider]?.btcwallet) {
      throw new Error('OneKey Wallet extension not found')
    }

    // OneKey provider stays the same for all networks
    this.bitcoinNetworkProvider = window[oneKeyProvider]?.btcwallet
  }

  async connectWallet(): Promise<this> {
    const self = await this.bitcoinNetworkProvider.connectWallet()
    return self
  }

  async getWalletProviderName(): Promise<string> {
    return this.bitcoinNetworkProvider.getWalletProviderName()
  }

  getBalance = async (): Promise<number> => {
    const network = await this.getNetwork()
    if (network === Network.MAINNET) {
      return await this.bitcoinNetworkProvider.getBalance()
    }
    return await super.getBalance()
  }

  pushTx = async (txHex: string): Promise<string> => {
    return await this.bitcoinNetworkProvider.pushTx(txHex)
  }

  async switchNetwork(network: Network) {
    return await this.bitcoinNetworkProvider.switchNetwork(
      INTERNAL_NETWORK_NAMES[network]
    )
  }
}
