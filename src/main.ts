import okxIcon from './icons/okx_wallet.svg'
import unisatIcon from './icons/unisat_wallet.svg'
import tomoIcon from './icons/tomo.png'
import bitgetIcon from './icons/bitget-wallet.png'
import onekeyIcon from './icons/onekey.svg'
import imtokenIcon from './icons/imtoken.svg'
import keystoneIcon from './icons/keystone.svg'
import keplrIcon from './icons/keplr_wallet.png'
import binanceIcon from './icons/binance.webp'
import { OKXWallet } from './providers/btc/okx_wallet'
import { UnisatWallet } from './providers/btc/unisat_wallet'
import { TomoWallet } from './providers/btc/tomo_wallet'
import { BitgetWallet } from './providers/btc/bitget_wallet'
import { OneKeyWallet } from './providers/btc/onekey_wallet'
import { ImTokenWallet } from './providers/btc/imtoken_wallet'
import { KeystoneWallet } from './providers/btc/keystone'
import { BinanceWallet } from './providers/btc/binance_wallet'
import { WalletProvider } from './wallet_provider'
import { KeplrWallet } from './providers/cosmos/keplr_wallet'

type TomoWalletType = 'extension' | 'qrcode' | 'injected'

type TomoWallet = {
  id: string
  img: string
  name: string
  chainType: string
  connectProvider?: typeof WalletProvider
  type: TomoWalletType
}

// Special case for the browser wallet. i.e injected wallet

export const walletList: TomoWallet[] = [
  {
    id: 'bitcoin_okx',
    img: okxIcon,
    name: 'OKX Bitcoin',
    chainType: 'bitcoin',
    connectProvider: OKXWallet,
    type: 'extension'
  },
  {
    id: 'bitcoin_unisat',
    img: unisatIcon,
    name: 'Unisat Wallet',
    chainType: 'bitcoin',
    connectProvider: UnisatWallet,
    type: 'extension'
  },
  {
    id: 'bitcoin_tomo',
    img: tomoIcon,
    name: 'Tomo Bitcoin',
    chainType: 'bitcoin',
    connectProvider: TomoWallet,
    type: 'extension'
  },
  {
    id: 'bitcoin_onekey',
    img: onekeyIcon,
    name: 'OneKey Bitcoin',
    chainType: 'bitcoin',
    connectProvider: OneKeyWallet,
    type: 'extension'
  },
  {
    id: 'bitcoin_bitget',
    img: bitgetIcon,
    name: 'Bitget Bitcoin',
    chainType: 'bitcoin',
    connectProvider: BitgetWallet,
    type: 'extension'
  },
  {
    id: 'cosmos_keplr',
    img: keplrIcon,
    name: 'Keplr',
    chainType: 'cosmos',
    connectProvider: KeplrWallet,
    type: 'extension'
  },
  {
    id: 'bitcoin_imtoken',
    img: imtokenIcon,
    name: 'imToken Bitcoin',
    chainType: 'bitcoin',
    connectProvider: ImTokenWallet,
    type: 'injected'
  },
  {
    id: 'bitcoin_binance',
    img: binanceIcon,
    name: 'Binance Bitcoin',
    chainType: 'bitcoin',
    connectProvider: BinanceWallet,
    type: 'injected'
  },
  {
    id: 'bitcoin_keystone',
    img: keystoneIcon,
    name: 'Keystone Bitcoin',
    chainType: 'bitcoin',
    connectProvider: KeystoneWallet,
    type: 'qrcode'
  }
]

export * from './wallet_provider'
export * from './utils/parseUnits'

export * from './providers/btc/btc_wallet'
export * from './providers/cosmos/keplr_wallet'
