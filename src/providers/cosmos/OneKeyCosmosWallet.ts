import { CosmosProvider } from './CosmosProvider'

export class OneKeyCosmosWallet extends CosmosProvider {
  constructor(chains: any[]) {
    // @ts-ignore
    const provider = window.$onekey?.cosmos
    if (!provider) {
      throw new Error('OneKey Wallet extension not found')
    }
    super(chains, provider)
  }
}
