import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react'
import { useGameStore } from '@/stores/gameStore'
import { PixiCanvas } from '@/components/PixiCanvas'
import { match3Scene } from '@/pixi/games/match3'
import { LEVELS } from '@/pixi/games/match3/config'
import { Match3HUD } from '@/components/Match3HUD'
import { Match3Overlay } from '@/components/Match3Overlay'

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

  const handleLevelSelect = (lvlNum: number) => {
    const config = LEVELS[lvlNum]
    if (config) {
      initLevelState(lvlNum, config.movesLimit, config.targetScore)
      useGameStore.setState({ level: lvlNum })
    }
  }

  const handleRestart = () => {
    handleLevelSelect(level)
  }

  const handleNextLevel = () => {
    const nextLvl = level + 1
    if (LEVELS[nextLvl]) {
      handleLevelSelect(nextLvl)
    } else {
      handleLevelSelect(1)
    }
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      p={6}
      position="relative"
      overflow="hidden"
    >
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

      <VStack gap={1} mb={6} textAlign="center">
        <Heading
          size="2xl"
          fontWeight="extrabold"
          style={{
            backgroundImage: 'linear-gradient(to right, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          letterSpacing="tight"
        >
          NEON MATCH-3
        </Heading>
        <Text color="text.secondary" fontSize="sm">
          Соберите 3 в ряд кликом или свайпом!
        </Text>
      </VStack>

      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        justify="center"
        gap={8}
        w="full"
        maxW="1200px"
        zIndex={1}
      >
        <Match3HUD
          level={level}
          score={score}
          movesLeft={movesLeft}
          targetScore={targetScore}
          onLevelSelect={handleLevelSelect}
          onRestart={handleRestart}
        />

        <Box
          position="relative"
          p={3}
          bg="bg.stage"
          border="2px solid"
          borderColor="border.accent"
          borderRadius="3xl"
          style={{ boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(170, 59, 255, 0.15)' }}
          overflow="hidden"
          w="824px"
          h="624px"
        >
          <PixiCanvas scene={match3Scene} width={800} height={600} />

          <Match3Overlay
            isGameOver={isGameOver}
            isGameWin={isGameWin}
            score={score}
            targetScore={targetScore}
            onRestart={handleRestart}
            onNextLevel={handleNextLevel}
          />
        </Box>
      </Flex>
    </Flex>
  )
}
