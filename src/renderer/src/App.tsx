import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { useTheme } from './context/ThemeProvider'
import BookStorePage from './pages/BookStorePage'

const AppContainer = styled.div<{ $theme: 'light' | 'dark' }>`
  width: 100%;
  height: 100vh;
  background: ${props => (props.$theme === 'dark' ? '#141414' : '#f0f0f0')};
  color: ${props => (props.$theme === 'dark' ? '#fff' : '#000')};
  overflow: hidden;
`

function App(): JSX.Element {
  const { theme } = useTheme()

  return (
    <AppContainer $theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<BookStorePage />} />
        </Routes>
      </HashRouter>
    </AppContainer>
  )
}

export default App
