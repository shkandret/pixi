import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

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

      <VStack gap={8} zIndex={1} textAlign="center">
        <VStack gap={2}>
          <Heading
            size="4xl"
            fontWeight="black"
            bgGradient="to-r"
            gradientFrom="brand.purple.500"
            gradientTo="brand.pink.500"
            bgClip="text"
            letterSpacing="tight"
          >
            PIXI ARCADE
          </Heading>
          <Text color="text.secondary" fontSize="lg" maxW="500px">
            Игровая платформа на React, Chakra UI и PixiJS.
          </Text>
        </VStack>

        <VStack gap={4} w="280px">
          <Button
            w="full"
            size="lg"
            bg="brand.purple.600"
            color="text.primary"
            _hover={{ bg: 'brand.purple.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            fontWeight="bold"
            onClick={() => navigate('/game')}
            boxShadow="0 0 20px rgba(170, 59, 255, 0.4)"
          >
            Играть в Neon Match-3
          </Button>

          <Button
            w="full"
            size="lg"
            variant="outline"
            borderColor="brand.purple.500"
            color="brand.purple.200"
            _hover={{ bg: 'rgba(170, 59, 255, 0.1)', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            fontWeight="bold"
            onClick={() => navigate('/test')}
          >
            Тестовая сцена Pixi
          </Button>
        </VStack>
      </VStack>
    </Flex>
  )
}
