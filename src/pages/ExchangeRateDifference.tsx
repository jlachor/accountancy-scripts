import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Loader2, Copy, FileDown } from 'lucide-react'
import { generateExchangeRateDiffPdf } from '@/lib/pdf-generators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { fetchExchangeRate, type CurrencyCode } from '@/lib/nbp-api'

interface LineItem {
  id: string
  date?: Date
  amount: string
  rate: string
  rateDate?: string
  paymentDate?: Date
  paymentRate: string
  paymentRateDate?: string
}

function createEmptyLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    date: undefined,
    amount: '',
    rate: '',
    rateDate: undefined,
    paymentDate: undefined,
    paymentRate: '',
    paymentRateDate: undefined,
  }
}

function calculatePln(amount: string, rate: string): number {
  const amountNum = parseFloat(amount)
  const rateNum = parseFloat(rate)
  if (isNaN(amountNum) || isNaN(rateNum)) return 0
  return Math.round(amountNum * rateNum * 100) / 100
}

function calculateDifference(amount: string, invoiceRate: string, paymentRate: string): number {
  const amountNum = parseFloat(amount)
  const invoiceRateNum = parseFloat(invoiceRate)
  const paymentRateNum = parseFloat(paymentRate)
  if (isNaN(amountNum) || isNaN(invoiceRateNum) || isNaN(paymentRateNum)) return 0
  return Math.round(amountNum * (paymentRateNum - invoiceRateNum) * 100) / 100
}

function formatPln(value: number): string {
  return value.toFixed(2)
}

interface LineItemRowProps {
  line: LineItem
  currency: CurrencyCode
  onUpdate: (updates: Partial<LineItem>) => void
  onClone: () => void
  onRemove: () => void
}

function LineItemRow({ line, currency, onUpdate, onClone, onRemove }: LineItemRowProps) {
  const { data: invoiceData, isFetching: invoiceFetching, isError: invoiceError } = useQuery({
    queryKey: ['exchangeRate', currency, line.date?.toISOString()],
    queryFn: () => fetchExchangeRate(currency, line.date!),
    enabled: !!line.date,
    staleTime: Infinity,
  })

  const { data: paymentData, isFetching: paymentFetching, isError: paymentError } = useQuery({
    queryKey: ['exchangeRate', currency, line.paymentDate?.toISOString()],
    queryFn: () => fetchExchangeRate(currency, line.paymentDate!),
    enabled: !!line.paymentDate,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (invoiceData) {
      onUpdate({
        rate: invoiceData.rate.toFixed(4),
        rateDate: invoiceData.effectiveDate,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceData])

  useEffect(() => {
    if (paymentData) {
      onUpdate({
        paymentRate: paymentData.rate.toFixed(4),
        paymentRateDate: paymentData.effectiveDate,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData])

  const invoicePln = calculatePln(line.amount, line.rate)
  const paymentPln = calculatePln(line.amount, line.paymentRate)
  const difference = calculateDifference(line.amount, line.rate, line.paymentRate)

  return (
    <div className="grid grid-cols-[140px_180px_100px_140px_180px_100px_100px_100px_72px] gap-2 items-center">
      <DatePicker
        value={line.date}
        onChange={(date) => {
          if (date?.getTime() !== line.date?.getTime()) {
            onUpdate({ date, rate: '', rateDate: undefined })
          }
        }}
      />
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            type="text"
            value={line.rate}
            readOnly
            placeholder={invoiceFetching ? '...' : '0.0000'}
            className={`w-24 bg-muted/50 cursor-default ${invoiceError ? 'border-destructive' : ''}`}
          />
          {invoiceFetching && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {line.rateDate && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ({line.rateDate})
          </span>
        )}
      </div>
      <Input
        type="number"
        step="0.01"
        placeholder="0.00"
        value={line.amount}
        onChange={(e) => onUpdate({ amount: e.target.value })}
      />
      <DatePicker
        value={line.paymentDate}
        onChange={(date) => {
          if (date?.getTime() !== line.paymentDate?.getTime()) {
            onUpdate({ paymentDate: date, paymentRate: '', paymentRateDate: undefined })
          }
        }}
      />
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            type="text"
            value={line.paymentRate}
            readOnly
            placeholder={paymentFetching ? '...' : '0.0000'}
            className={`w-24 bg-muted/50 cursor-default ${paymentError ? 'border-destructive' : ''}`}
          />
          {paymentFetching && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {line.paymentRateDate && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ({line.paymentRateDate})
          </span>
        )}
      </div>
      <span className="text-right font-mono">{formatPln(invoicePln)}</span>
      <span className="text-right font-mono">{formatPln(paymentPln)}</span>
      <span className={`text-right font-mono ${difference < 0 ? 'text-destructive' : difference > 0 ? 'text-green-600' : ''}`}>
        {formatPln(difference)}
      </span>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onClone}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface CurrencySectionProps {
  title: string
  currency: CurrencyCode
  lines: LineItem[]
  onLinesChange: (lines: LineItem[]) => void
}

function CurrencySection({ title, currency, lines, onLinesChange }: CurrencySectionProps) {
  const addLine = () => {
    onLinesChange([...lines, createEmptyLine()])
  }

  const removeLine = (id: string) => {
    onLinesChange(lines.filter((line) => line.id !== id))
  }

  const cloneLine = (id: string) => {
    const lineToClone = lines.find((line) => line.id === id)
    if (lineToClone) {
      const cloned = { ...lineToClone, id: crypto.randomUUID() }
      const index = lines.findIndex((line) => line.id === id)
      const newLines = [...lines]
      newLines.splice(index + 1, 0, cloned)
      onLinesChange(newLines)
    }
  }

  const updateLine = (id: string, updates: Partial<LineItem>) => {
    onLinesChange(
      lines.map((line) => (line.id === id ? { ...line, ...updates } : line))
    )
  }

  const sectionTotal = lines.reduce(
    (sum, line) => sum + calculateDifference(line.amount, line.rate, line.paymentRate),
    0
  )

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {lines.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-[140px_180px_100px_140px_180px_100px_100px_100px_72px] gap-2 text-sm font-medium text-muted-foreground">
            <span>Data faktury</span>
            <span>Kurs faktury (z dnia)</span>
            <span>Kwota</span>
            <span>Data zapłaty</span>
            <span>Kurs zapłaty (z dnia)</span>
            <span>Wart. faktury</span>
            <span>Wart. zapłaty</span>
            <span>Różnica</span>
            <span></span>
          </div>
          {lines.map((line) => (
            <LineItemRow
              key={line.id}
              line={line}
              currency={currency}
              onUpdate={(updates) => updateLine(line.id, updates)}
              onClone={() => cloneLine(line.id)}
              onRemove={() => removeLine(line.id)}
            />
          ))}
          <div className="grid grid-cols-[140px_180px_100px_140px_180px_100px_100px_100px_72px] gap-2 pt-2 border-t">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span className="text-right font-medium">Suma:</span>
            <span className={`text-right font-mono font-semibold ${sectionTotal < 0 ? 'text-destructive' : sectionTotal > 0 ? 'text-green-600' : ''}`}>
              {formatPln(sectionTotal)}
            </span>
            <span></span>
          </div>
        </div>
      )}
      <Button variant="outline" size="sm" onClick={addLine}>
        <Plus className="h-4 w-4 mr-1" />
        Dodaj
      </Button>
    </div>
  )
}

export function ExchangeRateDifference() {
  const [usdLines, setUsdLines] = useState<LineItem[]>([])
  const [eurLines, setEurLines] = useState<LineItem[]>([])

  const usdTotal = usdLines.reduce(
    (sum, line) => sum + calculateDifference(line.amount, line.rate, line.paymentRate),
    0
  )
  const eurTotal = eurLines.reduce(
    (sum, line) => sum + calculateDifference(line.amount, line.rate, line.paymentRate),
    0
  )
  const grandTotal = usdTotal + eurTotal

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Różnica kursowa</h1>
      <p className="text-muted-foreground mb-8">
        Oblicz różnicę kursową między kursem z dnia faktury a kursem z dnia zapłaty.
      </p>

      <div className="space-y-6">
        <CurrencySection
          title="USD"
          currency="USD"
          lines={usdLines}
          onLinesChange={setUsdLines}
        />

        <CurrencySection
          title="EUR"
          currency="EUR"
          lines={eurLines}
          onLinesChange={setEurLines}
        />

        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Suma różnic kursowych (PLN)</span>
            <span className={`text-2xl font-mono font-bold ${grandTotal < 0 ? 'text-destructive' : grandTotal > 0 ? 'text-green-600' : ''}`}>
              {formatPln(grandTotal)}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            generateExchangeRateDiffPdf({
              usd: { title: 'USD', lines: usdLines, total: usdTotal },
              eur: { title: 'EUR', lines: eurLines, total: eurTotal },
              grandTotal,
            })
          }
          disabled={usdLines.length === 0 && eurLines.length === 0}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Generuj PDF
        </Button>
      </div>
    </div>
  )
}
