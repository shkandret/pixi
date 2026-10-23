'use client'
import * as PIXI from 'pixi.js'
import { useEffect, useRef } from "react"

type appInitializer = (app: PIXI.Application) => void

interface PixiGameContainerProps {
  scene: appInitializer
  id?: string
}

export default function PixiGameContainer({ scene, id = 'pixi-container' }: PixiGameContainerProps) {
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    const pixiConfig = {
      width: 800,
      height: 600,
      background: '#1099bb',
      // antialias: true,
      // resolution: window.devicePixelRatio || 1,
      // autoDensity: true,
    };

    const init = async () => {
      const container = document.getElementById(id)
      if (!container) return

      const app = new PIXI.Application()
      await app.init(pixiConfig)
      container.appendChild(app.canvas)

      scene(app)
      appRef.current = app
    }

    init()

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, true)
        appRef.current = null
      }
    }
  }, [scene, id])

  return <div id={id} />
}