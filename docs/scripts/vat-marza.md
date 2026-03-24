# VAT Marża

Calculates the sale value for KPiR (tax book) using the VAT margin procedure.

## Purpose

Accounting tool for calculating the correct sale value to record in KPiR when selling goods under the VAT margin scheme. The margin scheme applies VAT only to the profit margin, not the full sale price.

## Inputs

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Sprzedaż z Faktury | number | - | Sale amount from the invoice (PLN) |
| Zakup z Faktury Zakupowej | number | - | Purchase amount from the purchase invoice (PLN) |
| Stawka VAT | dropdown | 23% | VAT rate (23%, 8%, 5%, 0%) |

## Calculation Steps

### Step 1: Gross Difference (Różnica Brutto)
```
Różnica Brutto = Sprzedaż − Zakup
```

### Step 2: Net Difference and VAT
```
Różnica Netto = Różnica Brutto ÷ (1 + Stawka VAT)
VAT = Różnica Brutto − Różnica Netto
```

### Step 3: Final Result (Sprzedaż w KPiR)
```
Sprzedaż w KPiR = Różnica Netto + Zakup
```

## Example

Given:
- Sprzedaż z Faktury: 1230.00 PLN
- Zakup z Faktury Zakupowej: 800.00 PLN
- Stawka VAT: 23%

Calculation:
1. Różnica Brutto = 1230.00 − 800.00 = **430.00**
2. Różnica Netto = 430.00 ÷ 1.23 = **349.59**
3. VAT = 430.00 − 349.59 = **80.41**
4. Sprzedaż w KPiR = 349.59 + 800.00 = **1149.59**

## User Interactions

- Enter sale and purchase amounts in the input fields
- Select VAT rate from the dropdown (defaults to 23%)
- Calculations appear automatically once both amounts are entered
- All values are displayed with 2 decimal places
- Each calculation step shows the formula visually with labeled values

## Tech Stack

- React + TypeScript
- shadcn/ui components
- No external API dependencies
