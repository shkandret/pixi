import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from '@/pages/HomePage'
import { TestPage } from '@/pages/TestPage'
import { GamePage } from '@/pages/GamePage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/test', element: <TestPage /> },
  { path: '/game', element: <GamePage /> },
])
