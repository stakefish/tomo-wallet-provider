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
    const key = await this.provider.getKey(curChainId)
    // await this.provider.enble(this.chainIds)
    this.offlineSigner = this.provider.getOfflineSigner(curChainId)
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

  async sendNativeToken(address: string, amount: string): Promise<string> {
    const curChainId = this.getChainId()
    const key = await this.provider.getKey(curChainId)

    const tx = {
      msgs: [
        {
          type: 'cosmos-sdk/MsgSend',
          value: {
            from_address: key.bech32Address,
            to_address: address,
            amount: [
              {
                denom: 'uatom', // Replace with the appropriate denomination
                amount: amount
              }
            ]
          }
        }
      ],
      fee: {
        amount: [
          {
            denom: 'uatom', // Replace with the appropriate denomination
            amount: '5000' // Replace with the appropriate fee amount
          }
        ],
        gas: '200000' // Replace with the appropriate gas limit
      },
      signatures: null,
      memo: ''
    }

    const signDoc: StdSignDoc = {
      chain_id: curChainId,
      account_number: '0', // Replace with the appropriate account number
      sequence: '0', // Replace with the appropriate sequence number
      fee: tx.fee,
      msgs: tx.msgs,
      memo: tx.memo
    }

    const { signed, signature } = await this.signAmino(
      key.bech32Address,
      signDoc
    )

    tx.signatures = [signature]
    // Serialize the signed transaction
    const serializedTx = new TextEncoder().encode(JSON.stringify(signed))
    // Send the transaction
    const result = await this.provider.sendTx(curChainId, serializedTx, 'sync')
    const res = new TextDecoder().decode(result)
    console.log(res)
    return res
  }
}
