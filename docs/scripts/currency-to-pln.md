# Currency to PLN Converter

Converts foreign currency amounts (USD, EUR) to PLN using exchange rates.

## Purpose

Accounting tool for converting foreign currency transactions to PLN for bookkeeping and tax reporting purposes.

## Structure

### Sections
- **USD Section** - for US Dollar transactions
- **EUR Section** - for Euro transactions

### Each Line Contains
| Field | Type | Precision | Description |
|-------|------|-----------|-------------|
| Date | date | - | Transaction date (datepicker) |
| Amount | number | 2 decimals | Amount in foreign currency |
| Exchange Rate | number | 4 decimals | Currency rate to PLN |
| PLN Value | calculated | 2 decimals | Amount × Rate (auto-calculated) |

### Totals
- **Section subtotal** - sum of all PLN values in that section
- **Grand total** - sum of USD section + EUR section

## User Interactions
- Click **Dodaj** button to add a new line to a section
- Click **Clone** button (copy icon) to duplicate a line
- Click **Delete** button (trash icon) to remove a line
- All PLN values recalculate automatically when inputs change
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
