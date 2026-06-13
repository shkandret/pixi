import { Link } from 'react-router-dom'

import { PixiCanvas } from '@/components/PixiCanvas'
import { testScene } from '@/pixi/games/test'

export function TestPage() {
  return (
    <>
      <h1>Test Scene</h1>
      <PixiCanvas scene={testScene} width={800} height={600} />
      <Link to="/">← Назад</Link>
    </>
  )
}
