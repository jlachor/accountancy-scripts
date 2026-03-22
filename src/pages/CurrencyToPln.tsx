import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Loader2 } from 'lucide-react'
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
}

function createEmptyLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    date: undefined,
    amount: '',
    rate: '',
    rateDate: undefined,
  }
}

function calculatePln(amount: string, rate: string): number {
  const amountNum = parseFloat(amount)
  const rateNum = parseFloat(rate)
  if (isNaN(amountNum) || isNaN(rateNum)) return 0
  return Math.round(amountNum * rateNum * 100) / 100
}

function formatPln(value: number): string {
  return value.toFixed(2)
}

interface LineItemRowProps {
  line: LineItem
  currency: CurrencyCode
  onUpdate: (updates: Partial<LineItem>) => void
  onRemove: () => void
}

function LineItemRow({ line, currency, onUpdate, onRemove }: LineItemRowProps) {
  const { isFetching, isError } = useQuery({
    queryKey: ['exchangeRate', currency, line.date?.toISOString()],
    queryFn: async () => {
      const result = await fetchExchangeRate(currency, line.date!)
      onUpdate({
        rate: result.rate.toFixed(4),
        rateDate: result.effectiveDate,
      })
      return result
    },
    enabled: !!line.date,
    staleTime: Infinity,
  })

  const plnValue = calculatePln(line.amount, line.rate)

  return (
    <div className="grid grid-cols-[140px_100px_180px_100px_40px] gap-2 items-center">
      <DatePicker
        value={line.date}
        onChange={(date) => onUpdate({ date, rate: '', rateDate: undefined })}
      />
      <Input
        type="number"
        step="0.01"
        placeholder="0.00"
        value={line.amount}
        onChange={(e) => onUpdate({ amount: e.target.value })}
      />
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            type="text"
            value={line.rate}
            readOnly
            placeholder={isFetching ? '...' : '0.0000'}
            className={`w-24 bg-muted/50 cursor-default ${isError ? 'border-destructive' : ''}`}
          />
          {isFetching && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {line.rateDate && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ({line.rateDate})
          </span>
        )}
      </div>
      <span className="text-right font-mono">{formatPln(plnValue)}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
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

  const updateLine = (id: string, updates: Partial<LineItem>) => {
    onLinesChange(
      lines.map((line) => (line.id === id ? { ...line, ...updates } : line))
    )
  }

  const sectionTotal = lines.reduce(
    (sum, line) => sum + calculatePln(line.amount, line.rate),
    0
  )

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="outline" size="sm" onClick={addLine}>
          <Plus className="h-4 w-4 mr-1" />
          Dodaj
        </Button>
      </div>

      {lines.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">
          Brak wpisów. Kliknij „Dodaj", aby dodać wiersz.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[140px_100px_180px_100px_40px] gap-2 text-sm font-medium text-muted-foreground">
            <span>Data</span>
            <span>Kwota</span>
            <span>Kurs (z dnia)</span>
            <span>PLN</span>
            <span></span>
          </div>
          {lines.map((line) => (
            <LineItemRow
              key={line.id}
              line={line}
              currency={currency}
              onUpdate={(updates) => updateLine(line.id, updates)}
              onRemove={() => removeLine(line.id)}
            />
          ))}
          <div className="grid grid-cols-[140px_100px_180px_100px_40px] gap-2 pt-2 border-t">
            <span></span>
            <span></span>
            <span className="text-right font-medium">Suma:</span>
            <span className="text-right font-mono font-semibold">
              {formatPln(sectionTotal)}
            </span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  )
}

export function CurrencyToPln() {
  const [usdLines, setUsdLines] = useState<LineItem[]>([])
  const [eurLines, setEurLines] = useState<LineItem[]>([])

  const usdTotal = usdLines.reduce(
    (sum, line) => sum + calculatePln(line.amount, line.rate),
    0
  )
  const eurTotal = eurLines.reduce(
    (sum, line) => sum + calculatePln(line.amount, line.rate),
    0
  )
  const grandTotal = usdTotal + eurTotal

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Przelicznik walut na PLN</h1>
      <p className="text-muted-foreground mb-8">
        Przelicz kwoty w USD i EUR na PLN według kursów wymiany.
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
            <span className="text-lg font-semibold">Suma całkowita (PLN)</span>
            <span className="text-2xl font-mono font-bold">
              {formatPln(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
