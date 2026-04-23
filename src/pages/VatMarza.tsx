import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { generateVatMarzaPdf } from '@/lib/pdf-generators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const VAT_RATES = [
  { value: '0.23', label: '23%' },
  { value: '0.08', label: '8%' },
  { value: '0.05', label: '5%' },
  { value: '0.00', label: '0%' },
]

function formatPln(value: number): string {
  return value.toFixed(2)
}

export function VatMarza() {
  const [sprzedaz, setSprzedaz] = useState('')
  const [zakup, setZakup] = useState('')
  const [vatRate, setVatRate] = useState('0.23')

  const sprzedazNum = parseFloat(sprzedaz) || 0
  const zakupNum = parseFloat(zakup) || 0
  const vatRateNum = parseFloat(vatRate)
  const vatPercent = Math.round(vatRateNum * 100)

  // Calculations
  const roznicaBrutto = sprzedazNum - zakupNum
  const roznicaNetto = roznicaBrutto / (1 + vatRateNum)
  const vat = roznicaBrutto - roznicaNetto
  const sprzedazKpir = roznicaNetto + zakupNum

  const hasInputs = sprzedaz !== '' && zakup !== ''

  const generatePdf = () => {
    generateVatMarzaPdf({
      sprzedaz: sprzedazNum,
      zakup: zakupNum,
      vatRate: vatRateNum,
      roznicaBrutto,
      roznicaNetto,
      vat,
      sprzedazKpir,
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">VAT Marża</h1>
      <p className="text-muted-foreground mb-8">
        Oblicz wartość sprzedaży do KPiR na podstawie procedury VAT marża.
      </p>

      <div className="space-y-6">
        {/* Input Section */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Dane wejściowe</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[240px_1fr] gap-4 items-center">
              <label className="font-medium">Sprzedaż z Faktury</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={sprzedaz}
                  onChange={(e) => setSprzedaz(e.target.value)}
                  className="max-w-40"
                />
                <span className="text-muted-foreground">PLN</span>
              </div>
            </div>
            <div className="grid grid-cols-[240px_1fr] gap-4 items-center">
              <label className="font-medium">Zakup z Faktury Zakupowej</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={zakup}
                  onChange={(e) => setZakup(e.target.value)}
                  className="max-w-40"
                />
                <span className="text-muted-foreground">PLN</span>
              </div>
            </div>
            <div className="grid grid-cols-[240px_1fr] gap-4 items-center">
              <label className="font-medium">Stawka VAT</label>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="h-8 max-w-40 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {VAT_RATES.map((rate) => (
                  <option key={rate.value} value={rate.value}>
                    {rate.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calculations Section */}
        {hasInputs && (
          <>
            {/* Step 1: Gross Difference */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Krok 1: Różnica Brutto</h2>
              <div className="bg-muted/30 rounded-md p-3 space-y-2">
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center text-center">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Sprzedaż</div>
                    <div className="font-mono">{formatPln(sprzedazNum)}</div>
                  </div>
                  <div className="text-xl text-muted-foreground">−</div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Zakup</div>
                    <div className="font-mono">{formatPln(zakupNum)}</div>
                  </div>
                  <div className="text-xl text-muted-foreground">=</div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Różnica Brutto</div>
                    <div className="font-mono font-bold text-lg">{formatPln(roznicaBrutto)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Net Difference and VAT */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Krok 2: Różnica Netto i VAT</h2>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-md p-3">
                  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center text-center">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Różnica Brutto</div>
                      <div className="font-mono">{formatPln(roznicaBrutto)}</div>
                    </div>
                    <div className="text-xl text-muted-foreground">÷</div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">1 + {vatPercent}%</div>
                      <div className="font-mono">{(1 + vatRateNum).toFixed(2)}</div>
                    </div>
                    <div className="text-xl text-muted-foreground">=</div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Różnica Netto</div>
                      <div className="font-mono font-bold text-lg">{formatPln(roznicaNetto)}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-md p-3">
                  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center text-center">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Różnica Brutto</div>
                      <div className="font-mono">{formatPln(roznicaBrutto)}</div>
                    </div>
                    <div className="text-xl text-muted-foreground">−</div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Różnica Netto</div>
                      <div className="font-mono">{formatPln(roznicaNetto)}</div>
                    </div>
                    <div className="text-xl text-muted-foreground">=</div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">VAT</div>
                      <div className="font-mono font-bold text-lg">{formatPln(vat)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Final Result */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h2 className="text-lg font-semibold mb-3">Krok 3: Sprzedaż w KPiR</h2>
              <div className="bg-background rounded-md p-3">
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center text-center">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Różnica Netto</div>
                    <div className="font-mono">{formatPln(roznicaNetto)}</div>
                  </div>
                  <div className="text-xl text-muted-foreground">+</div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Zakup</div>
                    <div className="font-mono">{formatPln(zakupNum)}</div>
                  </div>
                  <div className="text-xl text-muted-foreground">=</div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Sprzedaż w KPiR</div>
                    <div className="font-mono font-bold text-2xl">{formatPln(sprzedazKpir)}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Button variant="outline" onClick={generatePdf} disabled={!hasInputs}>
          <FileDown className="h-4 w-4 mr-2" />
          Generuj PDF
        </Button>
      </div>
    </div>
  )
}
