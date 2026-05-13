import { createContext, useContext, useState } from 'react'

interface DrawerState {
  nodeId: string
  integrationId: string
}

interface DrawerContextValue {
  drawerState: DrawerState | null
  openDrawer: (nodeId: string, integrationId: string) => void
  closeDrawer: () => void
}

const DrawerContext = createContext<DrawerContextValue>({
  drawerState: null,
  openDrawer: () => {},
  closeDrawer: () => {},
})

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null)
  return (
    <DrawerContext.Provider
      value={{
        drawerState,
        openDrawer: (nodeId, integrationId) => setDrawerState({ nodeId, integrationId }),
        closeDrawer: () => setDrawerState(null),
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  return useContext(DrawerContext)
}
