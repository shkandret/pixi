import { Container } from 'pixi.js'
import type { SceneDescriptor } from '@/pixi/shared'
import { Board } from './entities/Board'
import { createBoardLayer } from './layers/boardLayer'
import { GemsLayer } from './layers/gemsLayer'
import { InputSystem } from './systems/inputSystem'
import { GAME_SETTINGS, LEVELS } from './config'
import { useGameStore } from '@/stores/gameStore'

let unsubscribeFromStore: (() => void) | null = null
let currentInputSystem: InputSystem | null = null
let currentGemsLayer: GemsLayer | null = null

export const match3Scene: SceneDescriptor = {
  setup({ app }) {
    const rootContainer = new Container()
    const boardContainer = new Container()
    rootContainer.addChild(boardContainer)

    let isAnimating = false
    let board: Board
    let boardLayer: Container
    let gemsLayer: GemsLayer
    let inputSystem: InputSystem

    const loadLevel = (levelNumber: number) => {
      isAnimating = false

      if (gemsLayer) {
        gemsLayer.clearAll()
        boardContainer.removeChild(gemsLayer)
      }
      if (boardLayer) {
        boardContainer.removeChild(boardLayer)
      }
      if (inputSystem) {
        inputSystem.cleanup()
      }

      const config = LEVELS[levelNumber] || LEVELS[1]

      useGameStore.getState().initLevelState(config.id, config.movesLimit, config.targetScore)

      board = new Board(config)

      const boardWidth = config.cols * GAME_SETTINGS.cellSize
      const boardHeight = config.rows * GAME_SETTINGS.cellSize
      boardContainer.x = (app.screen.width - boardWidth) / 2
      boardContainer.y = (app.screen.height - boardHeight) / 2

      boardLayer = createBoardLayer(config.rows, config.cols)
      boardContainer.addChild(boardLayer)

      gemsLayer = new GemsLayer(app)
      boardContainer.addChild(gemsLayer)
      currentGemsLayer = gemsLayer

      for (let r = 0; r < board.rows; r++) {
        for (let c = 0; c < board.cols; c++) {
          const gem = board.getGem(r, c)
          if (gem) {
            const view = gemsLayer.spawnGem(gem.id, gem.type, r, c, r)
            view.animateSpawn(250)
          }
        }
      }

      const handleCascade = async (): Promise<void> => {
        const matches = board.findMatches()
        if (matches.length === 0) return

        const scoreGained = matches.length * 50
        useGameStore.getState().addScore(scoreGained)

        board.removeGems(matches)

        const destroyPromises = matches.map((gem) => {
          const view = gemsLayer.getGemView(gem.id)
          if (view) {
            gemsLayer.removeGem(gem.id)
            return view.animateDestroy(180)
          }
          return Promise.resolve()
        })
        await Promise.all(destroyPromises)

        const { moves, spawns } = board.applyGravityAndFill()

        const animationPromises: Promise<void>[] = []

        moves.forEach((move) => {
          const view = gemsLayer.getGemView(move.gemId)
          if (view) {
            const targetPos = gemsLayer.getScreenCoords(move.toRow, move.toCol)
            animationPromises.push(view.animateMoveTo(targetPos.x, targetPos.y, GAME_SETTINGS.fallSpeed))
          }
        })

        spawns.forEach((spawn) => {
          const view = gemsLayer.spawnGem(spawn.id, spawn.type, spawn.toRow, spawn.col, spawn.fromRow)
          const targetPos = gemsLayer.getScreenCoords(spawn.toRow, spawn.col)

          animationPromises.push(view.animateMoveTo(targetPos.x, targetPos.y, GAME_SETTINGS.fallSpeed))
          animationPromises.push(view.animateSpawn(GAME_SETTINGS.fallSpeed))
        })

        await Promise.all(animationPromises)

        await handleCascade()
      }

      const onSwapRequest = async (r1: number, c1: number, r2: number, c2: number) => {
        if (isAnimating) return
        isAnimating = true
        inputSystem.setEnabled(false)

        board.swapGems(r1, c1, r2, c2)

        const gem1 = board.getGem(r2, c2)
        const gem2 = board.getGem(r1, c1)

        if (!gem1 || !gem2) {
          isAnimating = false
          inputSystem.setEnabled(true)
          return
        }

        const view1 = gemsLayer.getGemView(gem1.id)
        const view2 = gemsLayer.getGemView(gem2.id)

        const pos1 = gemsLayer.getScreenCoords(r2, c2)
        const pos2 = gemsLayer.getScreenCoords(r1, c1)

        const anim1 = view1 ? view1.animateMoveTo(pos1.x, pos1.y, GAME_SETTINGS.animSpeed) : Promise.resolve()
        const anim2 = view2 ? view2.animateMoveTo(pos2.x, pos2.y, GAME_SETTINGS.animSpeed) : Promise.resolve()
        await Promise.all([anim1, anim2])

        const matches = board.findMatches()
        if (matches.length > 0) {
          useGameStore.getState().useMove()
          await handleCascade()
        } else {
          board.swapGems(r1, c1, r2, c2)

          const undoPos1 = gemsLayer.getScreenCoords(r1, c1)
          const undoPos2 = gemsLayer.getScreenCoords(r2, c2)
          const undo1 = view1 ? view1.animateMoveTo(undoPos1.x, undoPos1.y, GAME_SETTINGS.animSpeed) : Promise.resolve()
          const undo2 = view2 ? view2.animateMoveTo(undoPos2.x, undoPos2.y, GAME_SETTINGS.animSpeed) : Promise.resolve()
          await Promise.all([undo1, undo2])
        }

        isAnimating = false

        const state = useGameStore.getState()

        if (state.targetScore < Infinity) {
          if (state.score >= state.targetScore) {
            useGameStore.setState({ isGameWin: true })
            inputSystem.setEnabled(false)
          } else if (state.movesLeft <= 0) {
            useGameStore.setState({ isGameOver: true })
            inputSystem.setEnabled(false)
          } else {
            inputSystem.setEnabled(true)
          }
        } else {
          inputSystem.setEnabled(true)
        }
      }

      inputSystem = new InputSystem(board, gemsLayer, onSwapRequest)
      currentInputSystem = inputSystem

      inputSystem.setEnabled(true)
    }

    const initialLevel = useGameStore.getState().level
    loadLevel(initialLevel)

    let prevEpoch = useGameStore.getState().restartEpoch
    unsubscribeFromStore = useGameStore.subscribe((state) => {
      if (state.restartEpoch !== prevEpoch) {
        prevEpoch = state.restartEpoch
        loadLevel(state.level)
      }
    })

    return rootContainer
  },

  cleanup() {
    if (unsubscribeFromStore) {
      unsubscribeFromStore()
      unsubscribeFromStore = null
    }

    if (currentInputSystem) {
      currentInputSystem.cleanup()
      currentInputSystem = null
    }

    if (currentGemsLayer) {
      currentGemsLayer.clearAll()
      currentGemsLayer = null
    }
  },
}
