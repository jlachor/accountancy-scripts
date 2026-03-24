# Accountancy Scripts

A collection of accounting tools and calculators built with React + TypeScript.

## Tech Stack
- React 18 + TypeScript
- Vite
- React Router
- shadcn/ui components

## Scripts

| Script | Description | Status |
|--------|-------------|--------|
| [Currency to PLN](docs/scripts/currency-to-pln.md) | Convert USD/EUR to PLN with exchange rates | Done |
| [Exchange Rate Difference](docs/scripts/exchange-rate-difference.md) | Calculate exchange rate differences between calculated and actual payment | Done |

## Development

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  pages/           # Script pages (one per script)
  components/      # Reusable UI components
  layouts/         # App layouts
  lib/             # Utilities
docs/
  scripts/         # Documentation for each script
```
