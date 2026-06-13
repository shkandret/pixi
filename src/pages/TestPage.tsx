import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Flex, Heading, VStack } from '@chakra-ui/react'

import { PixiCanvas } from '@/components/PixiCanvas'
import { testScene } from '@/pixi/games/test'

export function TestPage() {
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

      <VStack gap={6} zIndex={1} textAlign="center" w="full" maxW="900px">
        <VStack gap={1}>
          <Heading
            size="2xl"
            fontWeight="extrabold"
            bgGradient="to-r"
            gradientFrom="brand.purple.500"
            gradientTo="brand.pink.500"
            bgClip="text"
            letterSpacing="tight"
          >
            ТЕСТОВАЯ СЦЕНА PIXI
          </Heading>
        </VStack>

        <Box
          position="relative"
          p={3}
          bg="bg.stage"
          border="2px solid"
          borderColor="border.accent"
          borderRadius="3xl"
          boxShadow="0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(170, 59, 255, 0.15)"
          overflow="hidden"
          w="824px"
          h="624px"
        >
          <PixiCanvas scene={testScene} width={800} height={600} />
        </Box>

        <Button
          asChild
          variant="ghost"
          color="text.secondary"
          _hover={{ color: 'text.primary', bg: 'rgba(255, 255, 255, 0.05)' }}
          size="md"
        >
          <RouterLink to="/">
            ← На главную
          </RouterLink>
        </Button>
      </VStack>
    </Flex>
  )
}
