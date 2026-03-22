export interface NbpRate {
  no: string
  effectiveDate: string
  mid: number
}

export interface NbpExchangeRateResponse {
  table: string
  currency: string
  code: string
  rates: NbpRate[]
}

export interface ExchangeRateResult {
  rate: number
  effectiveDate: string
}

export type CurrencyCode = 'USD' | 'EUR'

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function fetchExchangeRate(
  currency: CurrencyCode,
  date: Date
): Promise<ExchangeRateResult> {
  const endDate = formatDate(date)

  const startDate = new Date(date)
  startDate.setDate(startDate.getDate() - 7)
  const startDateStr = formatDate(startDate)

  const url = `https://api.nbp.pl/api/exchangerates/rates/a/${currency.toLowerCase()}/${startDateStr}/${endDate}/?format=json`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch rate: ${response.status}`)
  }

  const data: NbpExchangeRateResponse = await response.json()
  const lastRate = data.rates[data.rates.length - 1]

  return {
    rate: lastRate.mid,
    effectiveDate: lastRate.effectiveDate,
  }
}
