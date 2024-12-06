import { getWindow, Network, ProviderOption } from '../../WalletProvider'
import { BTCProvider } from './BTCProvider'

export const oneKeyProvider = '$onekey'

// Internal network names
const INTERNAL_NETWORK_NAMES = {
  [Network.MAINNET]: 'livenet',
  [Network.TESTNET]: 'testnet',
  [Network.SIGNET]: 'signet'
}

export class OneKeyBTCWallet extends BTCProvider {
  constructor(option: ProviderOption) {
    // @ts-ignore
    const bitcoinNetworkProvider = getWindow(option)[oneKeyProvider]?.btcwallet
    // check whether there is an OneKey extension
    if (!bitcoinNetworkProvider) {
      throw new Error('OneKey Wallet extension not found')
    }
    super(option, bitcoinNetworkProvider)
  }

  async connectWallet(): Promise<this> {
    // @ts-ignore
    const self = await this.bitcoinNetworkProvider.connectWallet()
    return self
  }

  getBalance = async (): Promise<number> => {
    const network = await this.getNetwork()
    if (network === Network.MAINNET) {
      // @ts-ignore
      return await this.bitcoinNetworkProvider.getBalance()
    }
    return await super.getBalance()
  }

  pushTx = async (txHex: string): Promise<string> => {
    // @ts-ignore
    return await this.bitcoinNetworkProvider.pushTx(txHex)
  }

  async switchNetwork(network: Network) {
    return await this.bitcoinNetworkProvider.switchNetwork(
      INTERNAL_NETWORK_NAMES[network] as Network
    )
  }
}
