import { Button, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react'

interface Match3OverlayProps {
  isGameOver: boolean
  isGameWin: boolean
  score: number
  targetScore: number
  onRestart: () => void
  onNextLevel: () => void
}

export function Match3Overlay({
  isGameOver,
  isGameWin,
  score,
  targetScore,
  onRestart,
  onNextLevel,
}: Match3OverlayProps) {
  if (!isGameOver && !isGameWin) return null

  if (isGameOver) {
    return (
      <Flex
        position="absolute"
        inset={0}
        bg="bg.overlay"
        direction="column"
        align="center"
        justify="center"
        gap={6}
        borderRadius="3xl"
        backdropFilter="blur(8px)"
        zIndex={10}
      >
        <VStack gap={1} textAlign="center">
          <Text color="status.error" fontWeight="bold" letterSpacing="widest" textTransform="uppercase">
            Закончились ходы
          </Text>
          <Heading size="3xl" color="text.primary" fontWeight="black">
            ИГРА ОКОНЧЕНА
          </Heading>
        </VStack>
        <Text color="text.secondary">
          Вы набрали <Text as="span" color="yellow.300" fontWeight="bold">{score}</Text> из {targetScore} очков.
        </Text>
        <Button
          size="lg"
          bg="brand.purple.600"
          color="text.primary"
          _hover={{ bg: 'brand.purple.500' }}
          onClick={onRestart}
          fontWeight="bold"
          px={8}
          boxShadow="0 0 15px rgba(170, 59, 255, 0.5)"
        >
          Повторить попытку
        </Button>
      </Flex>
    )
  }

  if (isGameWin) {
    return (
      <Flex
        position="absolute"
        inset={0}
        bg="bg.overlaySuccess"
        direction="column"
        align="center"
        justify="center"
        gap={6}
        borderRadius="3xl"
        backdropFilter="blur(8px)"
        zIndex={10}
      >
        <VStack gap={1} textAlign="center">
          <Text color="status.success" fontWeight="bold" letterSpacing="widest" textTransform="uppercase">
            Цель выполнена!
          </Text>
          <Heading size="3xl" color="text.primary" fontWeight="black">
            УРОВЕНЬ ПРОЙДЕН!
          </Heading>
        </VStack>
        <Text color="text.secondary">
          Ваш финальный счёт: <Text as="span" color="yellow.300" fontWeight="bold">{score}</Text> очков!
        </Text>
        <HStack gap={4}>
          <Button
            size="lg"
            variant="outline"
            borderColor="status.success"
            color="status.success"
            _hover={{ bg: 'rgba(52, 211, 153, 0.1)' }}
            onClick={onRestart}
            fontWeight="bold"
          >
            Заново
          </Button>
          <Button
            size="lg"
            bg="status.successDimmed"
            color="text.primary"
            _hover={{ bg: 'status.success' }}
            onClick={onNextLevel}
            fontWeight="bold"
            px={8}
            boxShadow="0 0 15px rgba(52, 211, 153, 0.5)"
          >
            Следующий уровень
          </Button>
        </HStack>
      </Flex>
    )
  }

  return null
}
