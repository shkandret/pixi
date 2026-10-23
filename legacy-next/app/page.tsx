import { BunnyRotate } from "@/components/pixi/games/BunnyRotate";
import { Fishpond } from "@/components/pixi/games/Fishpond";
import { TowerBlock } from "@/components/pixi/games/TowerBlock";
import PixiGameContainer from "@/components/pixi/PixiGameContainer";

export default function Home() {
  return (
    <>
      <PixiGameContainer scene={BunnyRotate} />
    </>
  );
}
