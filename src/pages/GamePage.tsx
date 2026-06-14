import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react'
import { useGameStore } from '@/stores/gameStore'
import { PixiCanvas } from '@/components/PixiCanvas'
import { match3Scene } from '@/pixi/games/match3'
import { LEVELS, CANVAS_SIZE } from '@/pixi/games/match3/config'
import { Match3HUD } from '@/components/Match3HUD'
import { Match3Overlay } from '@/components/Match3Overlay'

/** Maximum displayed width of the game area on large screens */
const MAX_GAME_WIDTH = 660

export function GamePage() {
  const {
    score,
    level,
    movesLeft,
    targetScore,
    isGameOver,
    isGameWin,
    initLevelState,
  } = useGameStore()

  /* ---------- Responsive canvas scaling ---------- */
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const update = () => {
      const available = Math.min(el.clientWidth, MAX_GAME_WIDTH)
      setScale(Math.min(1, available / CANVAS_SIZE))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* ---------- Level management ---------- */
  const handleLevelSelect = (lvlNum: number) => {
    const config = LEVELS[lvlNum]
    if (config) {
      initLevelState(lvlNum, config.movesLimit, config.targetScore)
      useGameStore.setState({ level: lvlNum })
    }
  }

  const handleRestart = () => handleLevelSelect(level)

  const handleNextLevel = () => {
    const nextLvl = level + 1
    if (LEVELS[nextLvl]) handleLevelSelect(nextLvl)
    else handleLevelSelect(1)
  }

  const displaySize = Math.round(CANVAS_SIZE * scale)

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative background blobs */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="brand.purple.800"
        opacity={0.15}
        filter="blur(120px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="brand.pink.800"
        opacity={0.15}
        filter="blur(150px)"
        pointerEvents="none"
      />

      {/* Title */}
      <VStack gap={1} mb={4} textAlign="center" zIndex={1}>
        <Heading
          size="2xl"
          fontWeight="extrabold"
          bgGradient="to-r"
          gradientFrom="brand.purple.500"
          gradientTo="brand.pink.500"
          bgClip="text"
          letterSpacing="tight"
        >
          NEON MATCH-3
        </Heading>
        <Text color="text.secondary" fontSize="sm">
          Соберите 3 в ряд кликом или свайпом!
        </Text>
      </VStack>

      {/* Game area — HUD above, canvas below, both constrained */}
      <VStack
        ref={wrapperRef}
        w="100%"
        maxW={`${MAX_GAME_WIDTH}px`}
        gap={3}
        zIndex={1}
      >
        {/* HUD — horizontal bar above the canvas */}
        <Match3HUD
          level={level}
          score={score}
          movesLeft={movesLeft}
          targetScore={targetScore}
          onLevelSelect={handleLevelSelect}
          onRestart={handleRestart}
        />

        {/* Canvas with decorative React backdrop */}
        <Box
          w={`${displaySize}px`}
          h={`${displaySize}px`}
          mx="auto"
          position="relative"
          borderRadius="2xl"
          overflow="hidden"
          bg="bg.stage"
          border="2px solid"
          borderColor="border.accent"
          boxShadow="0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(170, 59, 255, 0.15)"
        >
          {/* Scaled PixiJS canvas — transform preserves hit testing */}
          <Box
            w={`${CANVAS_SIZE}px`}
            h={`${CANVAS_SIZE}px`}
            transform={`scale(${scale})`}
            transformOrigin="top left"
            css={{ willChange: 'transform' }}
          >
            <PixiCanvas
              scene={match3Scene}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
            />
          </Box>

          {/* Game over / win overlay — fills visible area */}
          <Match3Overlay
            isGameOver={isGameOver}
            isGameWin={isGameWin}
            score={score}
            targetScore={targetScore}
            onRestart={handleRestart}
            onNextLevel={handleNextLevel}
          />
        </Box>
      </VStack>
    </Flex>
  )
}
