import { Link } from 'react-router-dom'

export function GamePage() {
  return (
    <>
      <h1>Game</h1>
      <p>Здесь будет игровая сцена</p>
      <Link to="/">← Назад</Link>
    </>
  )
}
