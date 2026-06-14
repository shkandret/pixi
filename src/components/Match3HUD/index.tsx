import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react'
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

  const movesColor =
    targetScore === Infinity
      ? 'brand.green.400'
      : movesLeft <= 5
        ? 'brand.red.400'
        : 'brand.purple.200'

  return (
    <VStack
      gap={0}
      w="full"
      bg="bg.panel"
      borderRadius="xl"
      border="1px solid"
      borderColor="border.subtle"
      overflow="hidden"
      backdropFilter="blur(12px)"
      shadow="2xl"
    >
      <Flex
        w="full"
        wrap="wrap"
        gap={{ base: 2, md: 3 }}
        px={3}
        py={2}
        align="center"
        justify="space-between"
      >
        {/* Level selector */}
        <HStack gap={1}>
          <Button
            size="xs"
            variant={level === 0 ? 'solid' : 'outline'}
            bg={level === 0 ? 'brand.purple.600' : 'transparent'}
            color={level === 0 ? 'text.primary' : 'brand.purple.200'}
            borderColor="brand.purple.500"
            _hover={{ bg: level === 0 ? 'brand.purple.500' : 'bg.purpleHover' }}
            onClick={() => onLevelSelect(0)}
            fontWeight="bold"
          >
            ∞
          </Button>
          {[1, 2, 3].map((lvlNum) => (
            <Button
              key={lvlNum}
              size="xs"
              variant={level === lvlNum ? 'solid' : 'outline'}
              bg={level === lvlNum ? 'brand.purple.600' : 'transparent'}
              color={level === lvlNum ? 'text.primary' : 'brand.purple.200'}
              borderColor="brand.purple.500"
              _hover={{ bg: level === lvlNum ? 'brand.purple.500' : 'bg.purpleHover' }}
              onClick={() => onLevelSelect(lvlNum)}
              fontWeight="bold"
            >
              {lvlNum}
            </Button>
          ))}
        </HStack>

        {/* Score + Target + Moves */}
        <HStack gap={4}>
          <HStack gap={1} align="baseline">
            <Text fontSize="xs" color="text.secondary">Счёт:</Text>
            <Text fontWeight="black" color="yellow.300" fontSize="md">
              {score}
            </Text>
            {targetScore < Infinity && (
              <Text fontSize="xs" color="text.secondary">/ {targetScore}</Text>
            )}
          </HStack>

          <HStack gap={1} align="baseline">
            <Text fontSize="xs" color="text.secondary">Ходы:</Text>
            <Text fontWeight="black" fontSize="md" color={movesColor}>
              {targetScore === Infinity ? '∞' : movesLeft}
            </Text>
          </HStack>
        </HStack>

        {/* Actions */}
        <HStack gap={1}>
          <Button
            size="xs"
            variant="outline"
            color="text.primary"
            borderColor="brand.purple.500"
            _hover={{ bg: 'bg.purpleHover' }}
            onClick={onRestart}
            fontWeight="bold"
          >
            ↻ Заново
          </Button>
          <Button
            size="xs"
            variant="ghost"
            color="text.secondary"
            _hover={{ color: 'text.primary', bg: 'bg.hudHighlight' }}
            onClick={() => navigate('/')}
          >
            ← Меню
          </Button>
        </HStack>
      </Flex>

      {/* Progress bar at the bottom of HUD */}
      {targetScore < Infinity && (
        <Box w="full" h="3px" bg="border.subtle">
          <Box
            w={`${progressPercent}%`}
            h="full"
            bgGradient="to-r"
            gradientFrom="yellow.500"
            gradientTo="orange.500"
            transition="width 0.3s ease-in-out"
          />
        </Box>
      )}
    </VStack>
  )
}
