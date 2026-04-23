# Exchange Rate Difference (Różnica Kursowa)

Calculates exchange rate differences between the invoice date rate and the payment date rate.

## Purpose

Accounting tool for calculating exchange rate differences that occur when the exchange rate changes between the invoice date and the payment date. This is essential for bookkeeping and tax reporting when dealing with foreign currency transactions.

## Structure

### Sections
- **USD Section** - for US Dollar transactions
- **EUR Section** - for Euro transactions

### Each Line Contains
| Field | Type | Precision | Description |
|-------|------|-----------|-------------|
| Data faktury | date | - | Invoice date (datepicker) |
| Kurs faktury | number | 4 decimals | Exchange rate on invoice date (auto-fetched) |
| Kwota | number | 2 decimals | Amount in foreign currency |
| Data zapłaty | date | - | Payment date (datepicker) |
| Kurs zapłaty | number | 4 decimals | Exchange rate on payment date (auto-fetched) |
| Wart. faktury | calculated | 2 decimals | Kwota × Kurs faktury (auto-calculated) |
| Wart. zapłaty | calculated | 2 decimals | Kwota × Kurs zapłaty (auto-calculated) |
| Różnica | calculated | 2 decimals | Kwota × (Kurs zapłaty - Kurs faktury) |

### Totals
- **Section subtotal** - sum of all "Różnica" values in that section
- **Grand total** - sum of USD section + EUR section differences

### Difference Interpretation
- **Positive difference** (green) - payment rate is higher than invoice rate (gain)
- **Negative difference** (red) - payment rate is lower than invoice rate (loss)

## User Interactions
- Click **Dodaj** button to add a new line to a section
- Click **Clone** button (copy icon) to duplicate a line
- Click **Delete** button (trash icon) to remove a line
- All calculated values update automatically when inputs change
- Standard rounding to 2 decimal places for PLN values

## Exchange Rate Logic

- Rates are fetched from **NBP API** (National Bank of Poland)
- When user picks a date (invoice or payment), API returns the rate from the **last working day** before or on that date
- Handles weekends and holidays automatically (queries 7-day range, takes last available)
- Both rate fields are **read-only** - populated automatically from API
- Each rate shows the actual date it was taken from (e.g., "3.8573 (2024-12-20)")

## Tech Stack
- React + TypeScript
- TanStack Query (caching, loading states)
- shadcn/ui components
- NBP API for exchange rates
