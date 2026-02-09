import { Composition } from 'remotion';
import { BitcoinWriterVideo } from './compositions/BitcoinWriter';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BitcoinWriter"
        component={BitcoinWriterVideo}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BitcoinWriterSquare"
        component={BitcoinWriterVideo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="BitcoinWriterVertical"
        component={BitcoinWriterVideo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
