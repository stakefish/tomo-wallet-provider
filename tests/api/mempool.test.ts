import { expect, test } from 'vitest'
import { parseUnits } from '../../src/utils/parseUnits'
import { getBaseUrl, setBtcApiUrl } from '../../src/mempoolApi'
import { Network } from '../../src/WalletProvider'

test(`getBaseUrl ${Network.MAINNET}`, async () => {
  expect(getBaseUrl(Network.MAINNET)).toBe('https://mempool.space/api/')
})

test(`getBaseUrl ${Network.TESTNET}`, async () => {
  expect(getBaseUrl(Network.TESTNET)).toBe('https://mempool.space/testnet/api/')
})
test(`getBaseUrl ${Network.SIGNET}`, async () => {
  expect(getBaseUrl(Network.SIGNET)).toBe('https://mempool.space/signet/api/')
})
;[Network.MAINNET, Network.TESTNET, Network.SIGNET].forEach((net) => {
  test(`getBaseUrl setBtcApiUrl ${net}`, async () => {
    const newUrl = 'https://xxxx.com/api'
    setBtcApiUrl(newUrl)
    expect(getBaseUrl(net)).toBe(`${newUrl}/`)
  })
})
