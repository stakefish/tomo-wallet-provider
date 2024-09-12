import { Network } from '../wallet_provider'
import { networks } from 'bitcoinjs-lib'

export const network = Network.MAINNET

interface NetworkConfig {
  coinName: string
  coinSymbol: string
  networkName: string
  network: Network
}

const mainnetConfig: NetworkConfig = {
  coinName: 'BTC',
  coinSymbol: 'BTC',
  networkName: 'BTC',
  network: Network.MAINNET
}

const signetConfig: NetworkConfig = {
  coinName: 'Signet BTC',
  coinSymbol: 'sBTC',
  networkName: 'BTC signet',
  network: Network.SIGNET
}

const testnetConfig: NetworkConfig = {
  coinName: 'Testnet BTC',
  coinSymbol: 'tBTC',
  networkName: 'BTC testnet',
  network: Network.TESTNET
}

export const toNetwork = (network: Network): networks.Network => {
  switch (network) {
    case Network.MAINNET:
      return networks.bitcoin
    case Network.TESTNET:
    case Network.SIGNET:
      return networks.testnet
    default:
      throw new Error('Unsupported network')
  }
}

export function validateAddress(network: Network, address: string): void {
  if (network === Network.MAINNET && !address.startsWith('bc1')) {
    throw new Error(
      "Incorrect address prefix for Mainnet. Expected address to start with 'bc1'."
    )
  } else if (
    [Network.SIGNET, Network.TESTNET].includes(network) &&
    !address.startsWith('tb1')
  ) {
    throw new Error(
      "Incorrect address prefix for Testnet / Signet. Expected address to start with 'tb1'."
    )
  } else if (
    ![Network.MAINNET, Network.SIGNET, Network.TESTNET].includes(network)
  ) {
    throw new Error(
      `Unsupported network: ${network}. Please provide a valid network.`
    )
  }
}
