import okxIcon from './icons/okx_wallet.svg'
import unisatIcon from './icons/unisat_wallet.svg'
import bitgetIcon from './icons/bitget-wallet.png'
import onekeyIcon from './icons/onekey.svg'
import imtokenIcon from './icons/imtoken.svg'
import keystoneIcon from './icons/keystone.svg'
import binanceIcon from './icons/binance.webp'
import { OKXWallet } from './providers/okx_wallet'
import { UnisatWallet } from './providers/unisat_wallet'
import { BitgetWallet } from './providers/bitget_wallet'
import { OneKeyWallet } from './providers/onekey_wallet'
import { ImTokenWallet } from './providers/imtoken_wallet'
import { KeystoneWallet } from './providers/keystone'
import { BinanceWallet } from './providers/binance_wallet'

type TomoWalletType = 'extension' | 'qrcode' | 'injected'

type TomoWallet = {
  id: string
  img: string
  name: string
  chainType: string
  connectProvider?: any
  wId?: string,
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
    id: 'bitcoin_keystone',
    img: keystoneIcon,
    name: 'Keystone Bitcoin',
    chainType: 'bitcoin',
    connectProvider: KeystoneWallet,
    type: 'qrcode'
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
  }
]
