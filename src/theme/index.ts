import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

import globalCss from "./globalCss";
import { recipes } from "./recipes";
import { slotRecipes } from "./slotRecipes";
import { semanticTokens, tokens } from "./tokens";

const config = defineConfig({
  globalCss,
  theme: {
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
  },
});

export const system = createSystem(defaultConfig, config);
