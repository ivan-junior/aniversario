import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminPage } from './pages/AdminPage'
import { FantasiaPage } from './pages/FantasiaPage'
import { FestaPage } from './pages/FestaPage'
import { HomePage } from './pages/HomePage'
import { VotacaoPage } from './pages/VotacaoPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/festa" element={<FestaPage />} />
        <Route path="/fantasia" element={<FantasiaPage />} />
        <Route path="/votar" element={<VotacaoPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
