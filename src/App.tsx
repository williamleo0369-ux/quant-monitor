import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MarketAnalysis from './pages/MarketAnalysis'
import StockSearch from './pages/StockSearch'
import StockBacktest from './pages/StockBacktest'
import SectorAnalysis from './pages/SectorAnalysis'
import HotspotTracking from './pages/HotspotTracking'
import StrategyBacktest from './pages/StrategyBacktest'
import PortfolioManagement from './pages/PortfolioManagement'
import MarketSentiment from './pages/MarketSentiment'
import EventDriven from './pages/EventDriven'
import RiskManagement from './pages/RiskManagement'
import DataCenter from './pages/DataCenter'
import FactorLibrary from './pages/FactorLibrary'
import AIAssistant from './pages/AIAssistant'
import KnowledgeBase from './pages/KnowledgeBase'
import SystemSettings from './pages/SystemSettings'

function App() {
  const [currentPage, setCurrentPage] = useState('market-analysis')

  const renderPage = () => {
    switch (currentPage) {
      case 'market-analysis':
        return <MarketAnalysis />
      case 'stock-search':
        return <StockSearch />
      case 'stock-backtest':
        return <StockBacktest />
      case 'sector-analysis':
        return <SectorAnalysis />
      case 'hotspot-tracking':
        return <HotspotTracking />
      case 'strategy-backtest':
        return <StrategyBacktest />
      case 'portfolio-management':
        return <PortfolioManagement />
      case 'market-sentiment':
        return <MarketSentiment />
      case 'event-driven':
        return <EventDriven />
      case 'risk-management':
        return <RiskManagement />
      case 'data-center':
        return <DataCenter />
      case 'factor-library':
        return <FactorLibrary />
      case 'ai-assistant':
        return <AIAssistant />
      case 'knowledge-base':
        return <KnowledgeBase />
      case 'system-settings':
        return <SystemSettings />
      default:
        return <MarketAnalysis />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
