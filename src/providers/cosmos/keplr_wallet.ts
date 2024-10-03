import { WalletProvider } from '../../wallet_provider'
import {
  AccountData,
  AminoSignResponse,
  Keplr,
  KeplrSignOptions,
  StdSignDoc
} from '@keplr-wallet/types'
import {
  OfflineAminoSigner,
  OfflineDirectSigner
} from '@keplr-wallet/types/src/cosmjs'

const providerName = 'keplr'
export class KeplrWallet extends WalletProvider {
  provider: Keplr
  offlineSigner?: OfflineAminoSigner & OfflineDirectSigner
  constructor(chains: any[]) {
    super(chains)
    // check whether there is an OKX Wallet extension
    if (!window[providerName]) {
      throw new Error('Keplr Wallet extension not found')
    }
    this.provider = window[providerName]
  }

  getChainId(): string {
    return this.chains[0].network
  }

  async connectWallet(): Promise<this> {
    const curChainId = this.getChainId()
    await this.provider.enable(curChainId)
    this.offlineSigner = this.provider.getOfflineSigner(curChainId)
    await this.offlineSigner.getAccounts()
    await this.getAddress()
    return this
  }
  getWalletProviderName(): Promise<string> {
    throw new Error('Method not implemented.')
  }

  /**
   * Gets the address of the connected wallet.
   * @returns A promise that resolves to the address of the connected wallet.
   */
  async getAddress(): Promise<string> {
    const curChainId = this.getChainId()
    const key = await this.provider.getKey(curChainId)
    return key.bech32Address
  }

  async getNetwork(): Promise<string> {
    return this.getChainId()
  }

  async getAccounts(): Promise<AccountData[]> {
    const key = await this.provider.getKey(this.getChainId())

    return [
      {
        address: key.bech32Address,
        // Currently, only secp256k1 is supported.
        algo: 'secp256k1',
        pubkey: key.pubKey
      }
    ]
  }

  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    if (this.getChainId() !== signDoc.chain_id) {
      throw new Error('Unmatched chain id with the offline signer')
    }

    const key = await this.provider.getKey(signDoc.chain_id)

    if (key.bech32Address !== signerAddress) {
      throw new Error('Unknown signer address')
    }

    return await this.provider.signAmino(
      this.getChainId(),
      signerAddress,
      signDoc,
      signOptions
    )
  }
}
