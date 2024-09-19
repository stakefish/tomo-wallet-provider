import { Fees, InscriptionResult, Network, UTXO } from './wallet_provider'

/*
    URL Construction methods
*/
// The base URL for the signet API
// Utilises an environment variable specifying the mempool API we intend to
// utilise
// const mempoolAPI = `${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet/api/`;

const getBaseUrl = (network: Network) => {
  if (network === Network.MAINNET) {
    return 'https://mempool.space/api/'
  } else if (network === Network.TESTNET) {
    return 'https://mempool.space/testnet/api/'
  } else if (network === Network.SIGNET) {
    return 'https://mempool.space/signet/api/'
  }
}

/**
 * Encode an object as url query string parameters
 * - includes the leading "?" prefix
 * - example input — {key: "value", alpha: "beta"}
 * - example output — output "?key=value&alpha=beta"
 * - returns empty string when given an empty object
 */
function encodeQueryString(params: Record<string, any>) {
  const keys = Object.keys(params)
  return keys.length
    ? '?' +
        keys
          .map(
            (key) =>
              encodeURIComponent(key) +
              '=' +
              (params[key] ? encodeURIComponent(params[key]) : '')
          )
          .join('&')
    : ''
}

// URL for the address info endpoint
function addressInfoUrl(network: Network, address: string): URL {
  return new URL(getBaseUrl(network) + 'address/' + address)
}

// URL for the transactions info endpoint
function txInfoUrl(network: Network, txid: string): URL {
  return new URL(getBaseUrl(network) + 'tx/' + txid)
}

// URL for the push transaction endpoint
function pushTxUrl(network: Network): URL {
  return new URL(getBaseUrl(network) + 'tx')
}

// URL for retrieving information about an address' UTXOs
function utxosInfoUrl(network: Network, address: string): URL {
  return new URL(getBaseUrl(network) + 'address/' + address + '/utxo')
}

// URL for retrieving information about the recommended network fees
function networkFeesUrl(network: Network): URL {
  return new URL(getBaseUrl(network) + 'v1/fees/recommended')
}

// URL for retrieving the tip height of the BTC chain
function btcTipHeightUrl(network: Network): URL {
  return new URL(getBaseUrl(network) + 'blocks/tip/height')
}

/**
 * Pushes a transaction to the Bitcoin network.
 * @param txHex - The hex string corresponding to the full transaction.
 * @returns A promise that resolves to the response message.
 */
export async function pushTx(network: Network, txHex: string): Promise<string> {
  const response = await fetch(pushTxUrl(network), {
    method: 'POST',
    body: txHex
  })
  if (!response.ok) {
    try {
      const mempoolError = await response.text()
      alert(`Error: ${mempoolError} ${network} ${pushTxUrl(network)}`)
      // Extract the error message from the response
      const message = mempoolError.split('"message":"')[1].split('"}')[0]
      if (mempoolError.includes('error') || mempoolError.includes('message')) {
        throw new Error(message)
      } else {
        throw new Error('Error broadcasting transaction. Please try again')
      }
    } catch (error: Error | any) {
      throw new Error(error?.message || error)
    }
  } else {
    return await response.text()
  }
}

/**
 * Returns the balance of an address.
 * @param address - The Bitcoin address in string format.
 * @returns A promise that resolves to the amount of satoshis that the address
 *          holds.
 */
export async function getAddressBalance(
  network: Network,
  address: string
): Promise<number> {
  const response = await fetch(addressInfoUrl(network, address))
  if (!response.ok) {
    const err = await response.text()
    throw new Error(err)
  } else {
    const addressInfo = await response.json()
    return (
      addressInfo.chain_stats.funded_txo_sum -
      addressInfo.chain_stats.spent_txo_sum
    )
  }
}

/**
 * Retrieve the recommended Bitcoin network fees.
 * @returns A promise that resolves into a `Fees` object.
 */
export async function getNetworkFees(network: Network): Promise<Fees> {
  const response = await fetch(networkFeesUrl(network))
  if (!response.ok) {
    const err = await response.text()
    throw new Error(err)
  } else {
    return await response.json()
  }
}
// Get the tip height of the BTC chain
export async function getTipHeight(network: Network): Promise<number> {
  const response = await fetch(btcTipHeightUrl(network))
  const result = await response.text()
  if (!response.ok) {
    throw new Error(result)
  }
  const height = Number(result)
  if (Number.isNaN(height)) {
    throw new Error('Invalid result returned')
  }
  return height
}

/**
 * Retrieve a set of UTXOs that are available to an address and are enough to
 * fund a transaction with a total `amount` of Satoshis in its output. The UTXOs
 * are chosen based on descending amount order.
 * @param address - The Bitcoin address in string format.
 * @param amount - The amount we expect the resulting UTXOs to satisfy.
 * @returns A promise that resolves into a list of UTXOs.
 */
export async function getFundingUTXOs(
  network: Network,
  address: string,
  amount: number,
  url?: URL
): Promise<UTXO[]> {
  // Get all UTXOs for the given address

  let utxos = null
  try {
    const response = await fetch(url || utxosInfoUrl(network, address))
    utxos = await response.json()
  } catch (error: Error | any) {
    throw new Error(error?.message || error)
  }

  // Remove unconfirmed UTXOs as they are not yet available for spending
  // and sort them in descending order according to their value.
  // We want them in descending order, as we prefer to find the least number
  // of inputs that will satisfy the `amount` requirement,
  // as less inputs lead to a smaller transaction and therefore smaller fees.
  const confirmedUTXOs = utxos
    .filter((utxo: any) => utxo.status.confirmed)
    .sort((a: any, b: any) => b.value - a.value)

  // Reduce the list of UTXOs into a list that contains just enough
  // UTXOs to satisfy the `amount` requirement.
  var sum = 0
  for (var i = 0; i < confirmedUTXOs.length; ++i) {
    sum += confirmedUTXOs[i].value
    if (sum > amount) {
      break
    }
  }
  if (sum < amount) {
    return []
  }
  const sliced = confirmedUTXOs.slice(0, i + 1)

  // Iterate through the final list of UTXOs to construct the result list.
  // The result contains some extra information,
  var result = []
  for (var i = 0; i < sliced.length; ++i) {
    const response = await fetch(
      url
        ? 'https://babylon.mempool.space/api/tx/' + sliced[i].txid
        : txInfoUrl(network, sliced[i].txid)
    )
    const transactionInfo = await response.json()
    result.push({
      txid: sliced[i].txid,
      vout: sliced[i].vout,
      value: sliced[i].value,
      scriptPubKey: transactionInfo.vout[sliced[i].vout].scriptpubkey
    })
  }
  return result
}

export async function getInscriptions(params: {
  address: string
  networkType: string
  cursor?: number
  size?: number
}): Promise<InscriptionResult> {
  const response = await fetch(
    `https://apps-prod.unyx.tech/api/openapi/bitcoin/inscriptions${encodeQueryString(
      params
    )}`
  )
  if (!response.ok) {
    const err = await response.text()
    throw new Error(err)
  } else {
    return (await response.json()).result
  }
}
