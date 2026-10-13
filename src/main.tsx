import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallbackTitle="Mapa Interativo — Falha na Renderização"
      fallbackMessage="Ocorreu uma instabilidade na inicialização do sistema do mapa. Clique abaixo para reiniciar a aplicação com segurança."
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

