import { Composition } from "remotion";
import { IronPactVideo } from "./MainVideo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={IronPactVideo}
    durationInFrames={600}
    fps={30}
    width={1920}
    height={1080}
  />
);
