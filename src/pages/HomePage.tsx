import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <>
      <h1>Главная</h1>
      <nav>
        <Link to="/test">Test</Link>
        {' | '}
        <Link to="/game">Game</Link>
      </nav>
    </>
  )
}
