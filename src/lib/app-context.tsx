import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type AppView = 'landing' | 'pools' | 'pool-detail'

interface AppState {
  currentView: AppView
  activePoolId: number | null
  walletBalance: number // In SOL
}

interface AppContextType {
  state: AppState
  navigateToLanding: () => void
  navigateToPools: () => void
  navigateToPool: (poolId: number) => void
  deductBalance: (amountSol: number) => void
  resetBalance: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

const DEFAULT_BALANCE_SOL = 10 // Default testnet balance

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>({
    currentView: 'landing',
    activePoolId: null,
    walletBalance: DEFAULT_BALANCE_SOL
  })

  // Load balance from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('solpve:wallet:balance')
        if (stored) {
          const balance = parseFloat(stored)
          if (!isNaN(balance) && balance >= 0) {
            setState(prev => ({ ...prev, walletBalance: balance }))
          }
        }
      } catch {}
    }
  }, [])

  // Save balance to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('solpve:wallet:balance', state.walletBalance.toString())
      } catch {}
    }
  }, [state.walletBalance])

  const navigateToLanding = () => {
    setState(prev => ({ ...prev, currentView: 'landing', activePoolId: null }))
  }

  const navigateToPools = () => {
    setState(prev => ({ ...prev, currentView: 'pools', activePoolId: null }))
  }

  const navigateToPool = (poolId: number) => {
    setState(prev => ({ ...prev, currentView: 'pool-detail', activePoolId: poolId }))
  }

  const deductBalance = (amountSol: number) => {
    setState(prev => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance - amountSol)
    }))
  }

  const resetBalance = () => {
    setState(prev => ({ ...prev, walletBalance: DEFAULT_BALANCE_SOL }))
  }

  return (
    <AppContext.Provider value={{
      state,
      navigateToLanding,
      navigateToPools,
      navigateToPool,
      deductBalance,
      resetBalance
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}