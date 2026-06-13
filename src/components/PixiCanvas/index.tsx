import { useEffect, useRef } from 'react'
import { Application } from 'pixi.js'
import { Box } from '@chakra-ui/react'

import type { SceneDescriptor } from '@/pixi/shared/types'

interface PixiCanvasProps {
  /** Дескриптор сцены — объект с setup() и опциональной cleanup() */
  scene: SceneDescriptor
  /** Ширина canvas в пикселях */
  width?: number
  /** Высота canvas в пикселях */
  height?: number
}

/**
 * Переиспользуемый React-компонент для рендеринга Pixi-сцен.
 *
 * - Создаёт и уничтожает Pixi Application при mount/unmount.
 * - Принимает SceneDescriptor для настройки содержимого сцены.
 * - Никогда не рендерит больше одного canvas одновременно.
 *
 * Использование:
 * ```tsx
 * import { testScene } from '@/pixi/scenes'
 * <PixiCanvas scene={testScene} width={800} height={600} />
 * ```
 */
export function PixiCanvas({ scene, width = 800, height = 600 }: PixiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    const app = new Application()

    const init = async () => {
      await app.init({
        width,
        height,
        background: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      if (cancelled) {
        app.destroy(true)
        return
      }

      appRef.current = app
      container.appendChild(app.canvas as HTMLCanvasElement)

      const root = await scene.setup({ app })
      app.stage.addChild(root)
    }

    init()

    return () => {
      cancelled = true

      if (appRef.current) {
        scene.cleanup?.({ app: appRef.current })
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }

      // Очищаем DOM на случай, если canvas уже был вставлен
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }, [scene, width, height])

  return (
    <Box
      ref={containerRef}
      width={`${width}px`}
      height={`${height}px`}
      borderRadius="lg"
      overflow="hidden"
    />
  )
}
