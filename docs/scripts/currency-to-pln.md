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
- Click **+** button to add a new line to a section
- All PLN values recalculate automatically when inputs change
- Standard rounding to 2 decimal places for PLN values

## Versions

### v1 (Current)
- Manual entry of all fields including exchange rate
- No API integration
- Basic form with datepicker (shadcn/ui)
- Real-time calculation of PLN values

### v2 (Planned)
- Auto-fetch exchange rate from NBP API based on selected date
