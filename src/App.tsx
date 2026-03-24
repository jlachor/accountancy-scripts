import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { Home } from '@/pages/Home'
import { CurrencyToPln } from '@/pages/CurrencyToPln'
import { ExchangeRateDifference } from '@/pages/ExchangeRateDifference'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="currency-to-pln" element={<CurrencyToPln />} />
        <Route path="exchange-rate-difference" element={<ExchangeRateDifference />} />
      </Route>
    </Routes>
  )
}

export default App
