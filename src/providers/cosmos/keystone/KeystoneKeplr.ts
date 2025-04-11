import KeystoneSDK, { KeystoneCosmosSDK, UR } from '@keystonehq/keystone-sdk'
import { AminoSignResponse, StdSignDoc } from '@cosmjs/amino'
import sdk, {
  PlayStatus,
  ReadStatus,
  SDK,
  SupportedResult
} from '@keystonehq/sdk'
import { bech32 } from 'bech32'
import { ripemd160, sha256 } from '@cosmjs/crypto'
import {
  BroadcastMode,
  KeplrSignOptions,
  Key,
  PubKey,
  SignDoc,
  StdSignature
} from '@keplr-wallet/types'
import { TomoChainCosmos } from '../../../WalletProvider'
import { Account } from '@keystonehq/keystone-sdk/dist/types/account'
import {
  SignDoc as SignDocUtil,
  SignDocDirectAux
} from '@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx'
import { DirectSignResponse } from '@keplr-wallet/types/src/cosmjs'
import Long from 'long'

// @ts-expect-error fix build undefined
const curSdk = sdk.default ? sdk.default : sdk
// @ts-expect-error fix build undefined
const curKeystoneSDK = KeystoneSDK?.default ? KeystoneSDK.default : KeystoneSDK

export class KeystoneKeplr {
  private viewSDK: typeof sdk
  private dataSdk: KeystoneSDK
  private account?: Account
  private publicKey?: Buffer
  private chains: TomoChainCosmos[]
  private xfp?: string

  constructor(chains: TomoChainCosmos[]) {
    this.chains = chains
    this.viewSDK = curSdk
    this.dataSdk = new curKeystoneSDK({
      origin: ''
    })
  }

  async enable(chainIds: string | string[]): Promise<void> {
    const chainId = Array.isArray(chainIds) ? chainIds[0] : chainIds
    const chain = this.chains.find((chain) => chain.network === chainId)
    if (!chain) {
      throw new Error(`ChainId ${chainId} not found`)
    }
    const keystoneContainer = await this.viewSDK.getSdk()
    const decodedResult = await keystoneContainer.read(
      [SupportedResult.UR_CRYPTO_MULTI_ACCOUNTS],
      {
        title: 'Sync Keystone with Babylon Staking App',
        description: 'Please scan the QR code displayed on your Keystone',
        renderInitial: {
          walletMode: 'cosmos',
          link: '',
          description: [
            '1. Version M-9.0 (Multi-Coin) or newer running on your Keystone Essential or Pro. ',
            '2. Click connect software wallet and use "Keplr" for connection.',
            '3. Press the "Sync Keystone" button and scan the QR Code displayed on your Keystone hardware wallet'
          ]
        },
        URTypeErrorMessage:
          "The scanned QR code can't be read. please verify and try again."
      }
    )
    // @ts-ignore
    const accountData = this.dataSdk.parseMultiAccounts(decodedResult.result)
    const atomKey = accountData.keys.find((item) => item.chain === 'ATOM')
    if (!atomKey) {
      throw new Error('Keystone does not support the Cosmos network.')
    }
    const publicKey = Buffer.from(atomKey.publicKey, 'hex')
    this.account = atomKey
    this.publicKey = publicKey
    this.xfp = accountData.masterFingerprint
  }

  async getKey(chainId: string): Promise<Key> {
    if (!this.publicKey) {
      throw new Error(`Keystone Wallet not connected`)
    }
    const chain = this.chains.find((chain) => chain.network === chainId)
    if (!chain) {
      throw new Error(`ChainId ${chainId} not found`)
    }

    const bech32PrefixAccAddr =
      chain.modularData?.bech32Config?.bech32PrefixAccAddr
    if (!bech32PrefixAccAddr) {
      throw new Error('chain.modularData.Bech32Config not specified')
    }

    const address = bech32.encode(
      bech32PrefixAccAddr,
      bech32.toWords(this.getRipemd160())
    )
    return {
      name: 'Keystone',
      algo: 'secp256k1',
      address: this.getRipemd160(),
      pubKey: new Uint8Array(this.publicKey),
      bech32Address: address,
      isNanoLedger: false,
      isKeystone: true
    } as Key
  }

  getRipemd160(): Uint8Array {
    if (!this.publicKey) {
      throw new Error(`Keystone Wallet not connected`)
    }
    // SHA256 + RIPEMD160
    const sha256Hash = sha256(this.publicKey)
    return ripemd160(sha256Hash)
  }

  getOfflineSigner(chainId: string, signOptions?: KeplrSignOptions) {
    return {
      getAccounts: async () =>
        [await this.getKey(chainId)].map((item) => ({
          address: item.bech32Address,
          pubkey: item.pubKey,
          algo: item.algo
        })),
      signAmino: this.signAmino.bind(this, chainId),
      signDirect: async (
        signerAddress: string,
        signDoc: SignDoc
      ): Promise<DirectSignResponse> => {
        if (!this.publicKey) {
          throw new Error(`Keystone Wallet not connected`)
        }
        // @ts-ignore
        const newSignDoc = {
          ...signDoc,
          accountNumber: signDoc.accountNumber.toString()
        } as SignDoc
        const genUrParams = {
          requestId: '7AFD5E09-9267-43FB-A02E-08C4A09417EC',
          signData: Buffer.from(toBytes(newSignDoc)).toString('hex'),
          dataType: KeystoneCosmosSDK.DataType.direct,
          accounts: [
            {
              path: this.account?.path,
              xfp: this.xfp,
              address: (await this.getKey(chainId)).bech32Address
            }
          ]
        }
        // @ts-ignore
        const ur = this.dataSdk.cosmos.generateSignRequest(genUrParams)
        const signMessage = composeQRProcess(
          SupportedResult.UR_COSMOS_SIGNATURE
        )

        const keystoneContainer = await this.viewSDK.getSdk()
        const signedMessageUR = await signMessage(keystoneContainer, ur)
        const result = this.dataSdk.cosmos.parseSignature(signedMessageUR)
        if (result.publicKey !== this.publicKey?.toString('hex')) {
          throw new Error('Public key mismatch')
        }
        const resutnValue = {
          signed: {
            ...signDoc,
            accountNumber: new Long(Number(signDoc.accountNumber))
          },
          signature: encodeSecp256k1Signature(
            this.publicKey,
            Buffer.from(result.signature, 'hex')
          )
        }
        return resutnValue
      }
    }
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    if (!this.publicKey) {
      throw new Error(`Keystone Wallet not connected`)
    }
    const signData = Buffer.from(serializeSignDoc(signDoc)).toString('hex')
    const ur = this.dataSdk.cosmos.generateSignRequest({
      requestId: '7AFD5E09-9267-43FB-A02E-08C4A09417EC',
      signData,
      dataType: KeystoneCosmosSDK.DataType.amino,
      accounts: [
        {
          path: this.account!.path,
          xfp: this.xfp!,
          address: (await this.getKey(chainId)).bech32Address
        }
      ]
    })
    const signMessage = composeQRProcess(SupportedResult.UR_COSMOS_SIGNATURE)

    const keystoneContainer = await this.viewSDK.getSdk()
    const signedMessageUR = await signMessage(keystoneContainer, ur)
    const result = this.dataSdk.cosmos.parseSignature(signedMessageUR)
    if (result.publicKey !== this.publicKey?.toString('hex')) {
      throw new Error('Public key mismatch')
    }
    const resutnValue = {
      signed: signDoc,
      signature: encodeSecp256k1Signature(
        this.publicKey,
        Buffer.from(result.signature, 'hex')
      )
    }
    return resutnValue
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    throw new Error('signArbitrary not supported yet')
  }

  async sendTx(
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    throw new Error('sendTx not implemented')
  }
}

export function sortObjectByKey(obj: Record<string, any>): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectByKey)
  }
  const sortedKeys = Object.keys(obj).sort()
  const result: Record<string, any> = {}
  sortedKeys.forEach((key) => {
    result[key] = sortObjectByKey(obj[key])
  })
  return result
}

export function sortedJsonByKeyStringify(obj: Record<string, any>): string {
  return JSON.stringify(sortObjectByKey(obj))
}

/**
 * Escapes <,>,& in string.
 * Golang's json marshaller escapes <,>,& by default.
 * However, because JS doesn't do that by default, to match the sign doc with cosmos-sdk,
 * we should escape <,>,& in string manually.
 * @param str
 */
export function escapeHTML(str: string): string {
  return str
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export function serializeSignDoc(signDoc: StdSignDoc): Uint8Array {
  return Buffer.from(escapeHTML(sortedJsonByKeyStringify(signDoc)))
}

/**
 * High order function to compose the QR generation and scanning process for specific data types.
 * Composes the QR code process for the Keystone device.
 * @param destinationDataType - The type of data to be read from the QR code.
 * @returns A function that plays the UR in the QR code and reads the result.
 */
const composeQRProcess =
  (destinationDataType: SupportedResult) =>
  async (container: SDK, ur: UR): Promise<UR> => {
    // make the container play the UR in the QR code
    const status: PlayStatus = await container.play(ur, {
      title: 'Scan the QR Code',
      description: 'Please scan the QR code with your Keystone device.'
    })

    // if the QR code is scanned successfully, read the result
    if (status !== PlayStatus.success)
      throw new Error('Could not generate the QR code, please try again.')

    const urResult = await container.read([destinationDataType], {
      title: 'Get the Signature from Keystone',
      description: 'Please scan the QR code displayed on your Keystone',
      URTypeErrorMessage:
        "The scanned QR code can't be read. please verify and try again."
    })

    // return the result if the QR code data(UR) of scanned successfully
    if (urResult.status !== ReadStatus.success)
      throw new Error('Could not extract the signature, please try again.')
    return urResult.result
  }

function toBytes(signDoc: SignDoc): Uint8Array {
  if ('authInfoBytes' in signDoc) {
    // @ts-ignore
    return SignDocUtil.encode(signDoc).finish()
  }
  return SignDocDirectAux.encode(signDoc).finish()
}

export function encodeSecp256k1Signature(
  pubkey: Uint8Array,
  signature: Uint8Array
): StdSignature {
  if (signature.length !== 64) {
    throw new Error(
      'Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s.'
    )
  }

  return {
    pub_key: encodeSecp256k1Pubkey(pubkey),
    signature: Buffer.from(signature).toString('base64')
  }
}

export function encodeSecp256k1Pubkey(pubkey: Uint8Array): PubKey {
  if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
    throw new Error(
      'Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03'
    )
  }
  return {
    type: 'tendermint/PubKeySecp256k1',
    value: Buffer.from(pubkey).toString('base64')
  }
}
