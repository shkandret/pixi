import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

interface Match3HUDProps {
  level: number
  score: number
  movesLeft: number
  targetScore: number
  onLevelSelect: (level: number) => void
  onRestart: () => void
}

export function Match3HUD({
  level,
  score,
  movesLeft,
  targetScore,
  onLevelSelect,
  onRestart,
}: Match3HUDProps) {
  const navigate = useNavigate()
  const progressPercent = targetScore < Infinity ? Math.min(100, (score / targetScore) * 100) : 0

  return (
    <VStack
      align="stretch"
      gap={5}
      p={6}
      bg="bg.panel"
      style={{ backdropFilter: 'blur(12px)' }}
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      w={{ base: 'full', lg: '320px' }}
      shadow="2xl"
    >
      <VStack align="stretch" gap={2}>
        <Text fontSize="xs" fontWeight="bold" color="brand.purple.500" letterSpacing="widest" textTransform="uppercase">
          Выберите Уровень
        </Text>
        <VStack gap={2} align="stretch">
          <Button
            variant={level === 0 ? 'solid' : 'outline'}
            bg={level === 0 ? 'brand.purple.600' : 'transparent'}
            color={level === 0 ? 'text.primary' : 'brand.purple.200'}
            borderColor="brand.purple.500"
            _hover={{ bg: level === 0 ? 'brand.purple.500' : 'rgba(170, 59, 255, 0.15)' }}
            onClick={() => onLevelSelect(0)}
            fontWeight="bold"
            size="sm"
            w="full"
          >
            Бесконечный режим (∞)
          </Button>
          <HStack gap={2}>
            {[1, 2, 3].map((lvlNum) => (
              <Button
                key={lvlNum}
                flex={1}
                variant={level === lvlNum ? 'solid' : 'outline'}
                bg={level === lvlNum ? 'brand.purple.600' : 'transparent'}
                color={level === lvlNum ? 'text.primary' : 'brand.purple.200'}
                borderColor="brand.purple.500"
                _hover={{ bg: level === lvlNum ? 'brand.purple.500' : 'rgba(170, 59, 255, 0.15)' }}
                onClick={() => onLevelSelect(lvlNum)}
                fontWeight="bold"
                size="sm"
              >
                Лвл {lvlNum}
              </Button>
            ))}
          </HStack>
        </VStack>
      </VStack>

      <Box h="1px" bg="border.subtle" />

      <HStack justify="space-between">
        <Text color="text.secondary" fontSize="sm">Цель:</Text>
        <Text fontWeight="extrabold" color="brand.pink.300" fontSize="lg">
          {targetScore === Infinity ? '∞ (Без цели)' : `${targetScore} очков`}
        </Text>
      </HStack>

      <VStack align="stretch" gap={1}>
        <HStack justify="space-between">
          <Text color="text.secondary" fontSize="sm">Счёт:</Text>
          <Text fontWeight="extrabold" fontSize="2xl" color="yellow.300" style={{ textShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}>
            {score}
          </Text>
        </HStack>
        {targetScore < Infinity ? (
          <Box w="full" h="10px" bg="rgba(255, 255, 255, 0.1)" borderRadius="full" overflow="hidden">
            <Box
              w={`${progressPercent}%`}
              h="full"
              style={{
                backgroundImage: 'linear-gradient(to right, #f59e0b, #f97316)',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
              }}
              transition="width 0.3s ease-in-out"
            />
          </Box>
        ) : (
          <Text fontSize="xs" color="text.secondary" fontStyle="italic">
            Режим свободной игры. Без ограничений!
          </Text>
        )}
      </VStack>

      <Box h="1px" bg="border.subtle" />

      <VStack gap={0} align="center" py={3} bg="rgba(255, 255, 255, 0.03)" borderRadius="xl" border="1px solid" borderColor="border.subtle">
        <Text fontSize="xs" color="text.secondary" fontWeight="bold" letterSpacing="wider" textTransform="uppercase">
          Ходов осталось
        </Text>
        <Text
          fontSize="5xl"
          fontWeight="black"
          color={targetScore === Infinity ? '#34d399' : (movesLeft <= 5 ? '#f87171' : '#a78bfa')}
          style={{
            textShadow: targetScore === Infinity ? '0 0 10px rgba(52, 211, 153, 0.2)' : (movesLeft <= 5 ? '0 0 15px rgba(239, 68, 68, 0.6)' : '0 0 10px rgba(167, 139, 250, 0.2)'),
          }}
        >
          {targetScore === Infinity ? '∞' : movesLeft}
        </Text>
      </VStack>

      <VStack gap={2} mt={2}>
        <Button
          w="full"
          variant="outline"
          color="text.primary"
          borderColor="brand.purple.500"
          _hover={{ bg: 'rgba(170, 59, 255, 0.15)' }}
          onClick={onRestart}
          size="md"
          fontWeight="bold"
        >
          Перезапустить
        </Button>
        <Button
          w="full"
          variant="ghost"
          color="text.secondary"
          _hover={{ color: 'text.primary', bg: 'rgba(255, 255, 255, 0.05)' }}
          size="sm"
          onClick={() => navigate('/')}
        >
          ← На главную
        </Button>
      </VStack>
    </VStack>
  )
}
