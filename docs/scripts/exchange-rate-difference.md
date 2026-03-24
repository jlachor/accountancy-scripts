# Exchange Rate Difference (Różnica Kursowa)

Calculates exchange rate differences between the calculated PLN value and actual payment amount.

## Purpose

Accounting tool for calculating exchange rate differences that occur when the actual payment in PLN differs from the value calculated using the official exchange rate. This is essential for bookkeeping and tax reporting when dealing with foreign currency transactions.

## Structure

### Sections
- **USD Section** - for US Dollar transactions
- **EUR Section** - for Euro transactions

### Each Line Contains
| Field | Type | Precision | Description |
|-------|------|-----------|-------------|
| Data | date | - | Transaction date (datepicker) |
| Kwota | number | 2 decimals | Amount in foreign currency |
| Kurs | number | 4 decimals | Exchange rate to PLN (auto-fetched) |
| Kwota Zapłaty | number | 2 decimals | Actual payment amount in PLN |
| Wartość | calculated | 2 decimals | Kwota × Kurs (auto-calculated) |
| Różnica | calculated | 2 decimals | Wartość - Kwota Zapłaty |

### Totals
- **Section subtotal** - sum of all "Różnica" values in that section
- **Grand total** - sum of USD section + EUR section differences

### Difference Interpretation
- **Positive difference** (green) - you paid less than the calculated value (gain)
- **Negative difference** (red) - you paid more than the calculated value (loss)

## User Interactions
- Click **Dodaj** button to add a new line to a section
- Click **Clone** button (copy icon) to duplicate a line
- Click **Delete** button (trash icon) to remove a line
- All calculated values update automatically when inputs change
- Standard rounding to 2 decimal places for PLN values

## Exchange Rate Logic

- Rates are fetched from **NBP API** (National Bank of Poland)
- When user picks a date, API returns the rate from the **last working day** before or on that date
- Handles weekends and holidays automatically (queries 7-day range, takes last available)
- Rate field is **read-only** - populated automatically from API
- Shows the actual date the rate was taken from (e.g., "3.8573 (2024-12-20)")

## Tech Stack
- React + TypeScript
- TanStack Query (caching, loading states)
- shadcn/ui components
- NBP API for exchange rates
