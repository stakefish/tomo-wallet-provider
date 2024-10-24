import { validateAddress } from '../../config/network.config'
import {
  InscriptionResult,
  Network,
  TomoChain,
  WalletInfo
} from '../../WalletProvider'
import { parseUnits } from '../../utils/parseUnits'
import { BTCProvider } from './BTCProvider'

export class OKXBTCWallet extends BTCProvider {
  private okxWalletInfo: WalletInfo | undefined
  private okxWallet: any
  private networkEnv: Network | undefined = Network.MAINNET

  constructor(chains: TomoChain[]) {
    // @ts-ignore
    const okxWallet = window.okxwallet
    const bitcoinNetworkProvider = okxWallet?.bitcoin
    // check whether there is an OKX Wallet extension
    if (!bitcoinNetworkProvider) {
      throw new Error('OKX Wallet extension not found')
    }
    super(chains, bitcoinNetworkProvider)
    this.okxWallet = okxWallet
  }

  async connectWallet(): Promise<this> {
    try {
      await this.okxWallet.enable() // Connect to OKX Wallet extension
    } catch (error) {
      if ((error as Error)?.message?.includes('rejected')) {
        throw new Error('Connection to OKX Wallet was rejected')
      } else {
        throw new Error((error as Error)?.message)
      }
    }
    let result = null
    try {
      // this will not throw an error even if user has no network enabled
      result = await this.bitcoinNetworkProvider.connect()
    } catch (error) {
      throw new Error(`BTC ${this.networkEnv} is not enabled in OKX Wallet`)
    }

    const { address, compressedPublicKey } = result

    validateAddress(this.networkEnv, address)

    if (compressedPublicKey && address) {
      this.okxWalletInfo = {
        publicKeyHex: compressedPublicKey,
        address
      }
      return this
    } else {
      throw new Error('Could not connect to OKX Wallet')
    }
  }

  getWalletProviderName = async (): Promise<string> => {
    return 'OKX'
  }

  getAddress = async (): Promise<string> => {
    return await this.bitcoinNetworkProvider.getSelectedAddress()
  }

  getNetwork = async (): Promise<Network> => {
    // OKX does not provide a way to get the network for Signet and Testnet
    // So we pass the check on connection and return the environment network
    if (!this.networkEnv) {
      throw new Error('Network not set')
    }
    return this.networkEnv
  }

  async switchNetwork(network: Network) {
    switch (network) {
      case Network.MAINNET:
        this.bitcoinNetworkProvider = this.okxWallet.bitcoin
        break
      case Network.TESTNET:
        this.bitcoinNetworkProvider = this.okxWallet.bitcoinTestnet
        break
      case Network.SIGNET:
        this.bitcoinNetworkProvider = this.okxWallet.bitcoinSignet
        break
      default:
        throw new Error('Unsupported network')
    }
    this.networkEnv = network
    await this.connectWallet()
  }

  async sendBitcoin(to: string, satAmount: number) {
    const result = await this.bitcoinNetworkProvider.sendBitcoin(
      to,
      parseUnits(satAmount.toString(), 8).toString()
    )
    return result
  }

  getPublicKeyHex = async () => {
    if (!this.okxWalletInfo) {
      throw new Error('OKX Wallet not connected')
    }
    return this.okxWalletInfo.publicKeyHex
  }

  getBalance = async (): Promise<number> => {
    return (await this.bitcoinNetworkProvider.getBalance()).total
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
