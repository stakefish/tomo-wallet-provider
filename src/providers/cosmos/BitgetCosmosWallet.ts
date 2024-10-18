import { CosmosProvider } from './CosmosProvider'

export class BitgetCosmosWallet extends CosmosProvider {
  constructor(chains: any[]) {
    // @ts-ignore
    const provider = window.bitkeep?.keplr
    if (!provider) {
      throw new Error('Bitget Wallet extension not found')
    }
    super(chains, provider)
  }
}
