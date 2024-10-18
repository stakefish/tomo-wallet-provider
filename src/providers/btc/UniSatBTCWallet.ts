import {
  InscriptionResult,
  Network,
  WalletInfo,
  WalletProvider
} from '../../WalletProvider'
import { parseUnits } from '../../utils/parseUnits'
import { BTCProvider } from './BTCProvider'

export const unisatProvider = 'unisat'

export class UniSatBTCWallet extends BTCProvider {
  private unisatWalletInfo: WalletInfo | undefined

  constructor() {
    // @ts-ignore
    const bitcoinNetworkProvider = window[unisatProvider]
    // check whether there is an OKX Wallet extension
    if (!bitcoinNetworkProvider) {
      throw new Error('UniSat Wallet extension not found')
    }
    super(bitcoinNetworkProvider)
  }

  connectWallet = async (): Promise<this> => {
    const unisatwallet = this.bitcoinNetworkProvider
    try {
      const accounts = await unisatwallet.requestAccounts()
      const compressedPublicKey = await unisatwallet.getPublicKey()
      if (compressedPublicKey && accounts[0]) {
        this.unisatWalletInfo = {
          publicKeyHex: compressedPublicKey,
          address: accounts[0]
        }
        return this
      }
      return this
    } catch (error) {
      throw new Error('Failed to connect to unisat wallet')
    }
  }

  getWalletProviderName = async (): Promise<string> => {
    return 'UniSat'
  }

  async switchNetwork(network: Network) {
    return await this.bitcoinNetworkProvider.switchNetwork(
      network.replace('mainnet', 'livenet')
    )
  }

  async sendBitcoin(to: string, satAmount: number) {
    const result = await this.bitcoinNetworkProvider.sendBitcoin(
      to,
      Number(parseUnits(satAmount.toString(), 8))
    )
    return result
  }

  getBalance = async (): Promise<number> => {
    const result = await this.bitcoinNetworkProvider.getBalance()
    return result.total
  }

  pushTx = async (txHex: string): Promise<string> => {
    return await this.bitcoinNetworkProvider.pushTx(txHex)
  }
  async getInscriptions(
    cursor?: number,
    size?: number
  ): Promise<InscriptionResult> {
    return await this.bitcoinNetworkProvider.getInscriptions(cursor, size)
  }
}
