import { Network, TomoChain, WalletProvider } from '../../WalletProvider'
import { Psbt } from 'bitcoinjs-lib'
import { parseUnits } from '../../utils/parseUnits'
import { toNetwork } from '../../config/network.config'
import { initBTCEccLib } from '../../utils/eccLibUtils'
import { BTCProvider } from './BTCProvider'

export class BinanceBTCWallet extends BTCProvider {
  constructor(chains: TomoChain[]) {
    // @ts-ignore
    const bitcoinNetworkProvider = window?.binancew3w?.bitcoin
    if (!bitcoinNetworkProvider) {
      throw new Error('Binance Wallet not found')
    }
    super(chains, bitcoinNetworkProvider)
    initBTCEccLib()
  }

  connectWallet = async (): Promise<this> => {
    const accounts = await this.bitcoinNetworkProvider.requestAccounts()

    const address = accounts[0]
    const publicKeyHex = await this.getPublicKeyHex()

    if (!address || !publicKeyHex) {
      throw new Error('Could not connect to imToken Wallet')
    }
    return this
  }

  getWalletProviderName = async (): Promise<string> => {
    return this.bitcoinNetworkProvider.name
  }

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    throw new Error('Method "signPsbts" not implemented.')
  }

  on = (eventName: string, callBack: () => void) => {
    if (eventName === 'accountChanged') {
      return this.bitcoinNetworkProvider?.on('accountsChanged', callBack)
    }
    return this.bitcoinNetworkProvider?.on(eventName, callBack)
  }

  off = (eventName: string, callBack: () => void) => {
    if (eventName === 'accountChanged') {
      return this.bitcoinNetworkProvider?.removeListener(
        'accountsChanged',
        callBack
      )
    }
    return this.bitcoinNetworkProvider?.removeListener(eventName, callBack)
  }

  getBalance = async (): Promise<number> => {
    return await this.bitcoinNetworkProvider.getBalance(await this.getAddress())
  }

  async sendBitcoin(to: string, satAmount: number) {
    satAmount = Number(parseUnits(satAmount.toString(), 8).toString())
    const walletAddress = await this.getAddress()
    const utxos = await this.getUtxos(walletAddress)
    utxos.sort((a, b) => a.value - b.value)
    let totalInput = 0
    const inputs = []
    const FeeRate = (await this.getNetworkFees()).fastestFee
    let estimatedFee = 0

    for (const utxo of utxos) {
      inputs.push({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPubKey, 'hex'),
          value: utxo.value
        }
      })

      totalInput += utxo.value

      const estimatedTxSize = inputs.length * 180 + 2 * 34 + 10
      estimatedFee = estimatedTxSize * FeeRate

      if (totalInput >= satAmount + estimatedFee) {
        break
      }
    }
    if (totalInput < satAmount + estimatedFee) {
      throw new Error('1Insufficient funds for the transaction.')
    }
    if (inputs.length === 0) {
      throw new Error('No inputs available for the transaction.')
    }
    const changeAmount = totalInput - satAmount - estimatedFee

    const psbt = new Psbt({ network: toNetwork(await this.getNetwork()) })

    for (const input of inputs) {
      psbt.addInput(input)
    }

    psbt.addOutput({
      address: to,
      value: satAmount
    })

    if (changeAmount > 0) {
      const changeAddress = await this.getAddress()
      psbt.addOutput({
        address: changeAddress,
        value: changeAmount
      })
    }

    const signedPsbtHex = await this.signPsbt(psbt.toHex())
    const pushData = Psbt.fromHex(signedPsbtHex).extractTransaction()

    const txId = await this.pushTx(pushData.toHex())
    return txId
  }

  async switchNetwork(network: Network): Promise<void> {
    await this.bitcoinNetworkProvider.switchNetwork(
      network.replace('mainnet', 'livenet')
    )
  }
}
