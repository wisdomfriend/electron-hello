import '@renderer/databases'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from '@renderer/store'
import App from './App'
import AntdProvider from './context/AntdProvider'
import { ThemeProvider } from './context/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AntdProvider>
            <App />
          </AntdProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
