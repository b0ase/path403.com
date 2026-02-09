import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { AnimatedText, AnimatedParagraph } from '../components/AnimatedText';

// Scene components
const Scene1_Title: React.FC = () => {
  const frame = useCurrentFrame();

  const logoScale = interpolate(frame, [0, 30], [0.5, 1], {
    extrapolateRight: 'clamp',
  });

  const glowOpacity = interpolate(frame, [20, 60], [0, 0.6], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Bitcoin glow effect */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,147,26,0.3) 0%, transparent 70%)',
        opacity: glowOpacity,
        filter: 'blur(40px)',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${logoScale})`,
      }}>
        {/* Bitcoin symbol */}
        <div style={{
          fontSize: 120,
          color: '#F7931A',
          fontWeight: 'bold',
          textShadow: '0 0 60px rgba(247,147,26,0.5)',
        }}>
          ₿
        </div>

        <AnimatedText
          text="Bitcoin Writer"
          startFrame={15}
          type="scaleIn"
          duration={25}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            letterSpacing: '-2px',
            marginTop: 20,
          }}
        />

        <AnimatedText
          text="Write. Save. Own."
          startFrame={45}
          type="fadeIn"
          duration={20}
          style={{
            fontSize: 28,
            color: '#F7931A',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            marginTop: 20,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Scene2_Problem: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: '#0a0a0a',
      padding: 80,
      justifyContent: 'center',
    }}>
      <AnimatedText
        text="Your words exist at the mercy of platforms."
        startFrame={0}
        type="slideUp"
        duration={25}
        style={{
          fontSize: 52,
          fontWeight: 'bold',
          color: 'white',
          maxWidth: '80%',
          lineHeight: 1.3,
        }}
      />

      <AnimatedParagraph
        lines={[
          "Companies go bankrupt.",
          "Services shut down.",
          "Accounts get terminated.",
          "The words remain until they don't.",
        ]}
        startFrame={40}
        lineDelay={20}
        style={{ marginTop: 50 }}
        lineStyle={{
          fontSize: 32,
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 15,
        }}
      />
    </AbsoluteFill>
  );
};

const Scene3_Solution: React.FC = () => {
  const frame = useCurrentFrame();

  const blockchainGlow = interpolate(frame, [0, 40, 80, 120], [0, 1, 1, 0.8], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0f1729 100%)',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Chain links animation */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        gap: 20,
        opacity: blockchainGlow,
      }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            width: 100,
            height: 60,
            border: '3px solid #F7931A',
            borderRadius: 10,
            opacity: interpolate(frame, [i * 15, i * 15 + 20], [0, 1], {
              extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [i * 15, i * 15 + 20], [20, 0], {
              extrapolateRight: 'clamp',
            })}px)`,
          }} />
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        zIndex: 1,
        marginTop: 150,
      }}>
        <AnimatedText
          text="The blockchain offers permanence."
          startFrame={30}
          type="scaleIn"
          duration={25}
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            color: 'white',
          }}
        />

        <AnimatedParagraph
          lines={[
            "Cannot be altered.",
            "Cannot be deleted.",
            "Cannot be lost.",
          ]}
          startFrame={60}
          lineDelay={15}
          style={{ marginTop: 40 }}
          lineStyle={{
            fontSize: 36,
            color: '#F7931A',
            marginBottom: 10,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Scene4_Tokens: React.FC = () => {
  const frame = useCurrentFrame();

  const coinRotation = interpolate(frame, [0, 120], [0, 360]);

  return (
    <AbsoluteFill style={{
      background: '#0a0a0a',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
        {/* Animated coin */}
        <div style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F7931A 0%, #FFC107 50%, #F7931A 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `rotateY(${coinRotation}deg)`,
          boxShadow: '0 0 60px rgba(247,147,26,0.5)',
        }}>
          <span style={{
            fontSize: 100,
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            $B
          </span>
        </div>

        <div style={{ maxWidth: 600 }}>
          <AnimatedText
            text="$bWriter"
            startFrame={10}
            type="slideUp"
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#F7931A',
            }}
          />

          <AnimatedParagraph
            lines={[
              "1 billion tokens total.",
              "Earn tokens when you save.",
              "Receive dividends in Bitcoin.",
            ]}
            startFrame={30}
            lineDelay={20}
            style={{ marginTop: 30 }}
            lineStyle={{
              fontSize: 32,
              color: 'white',
              marginBottom: 15,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene5_CTA: React.FC = () => {
  const frame = useCurrentFrame();

  const pulseScale = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.05, 1]
  );

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0f00 50%, #0a0a0a 100%)',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 50%, rgba(247,147,26,0.1) 0%, transparent 50%)',
      }} />

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <AnimatedText
          text="Bitcoin Writer"
          startFrame={0}
          type="scaleIn"
          duration={20}
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
          }}
        />

        <AnimatedText
          text="is live at b0ase.com"
          startFrame={20}
          type="fadeIn"
          duration={20}
          style={{
            fontSize: 40,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: 50,
          }}
        />

        <div style={{
          transform: `scale(${pulseScale})`,
          marginTop: 30,
        }}>
          <AnimatedText
            text="Write something. Save it to the chain."
            startFrame={50}
            type="slideUp"
            style={{
              fontSize: 36,
              color: '#F7931A',
              fontWeight: 'bold',
            }}
          />
        </div>

        <AnimatedText
          text="See what ownership feels like."
          startFrame={80}
          type="fadeIn"
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 20,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Main composition
export const BitcoinWriterVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Scene 1: Title (0-90 frames = 0-3 seconds) */}
      <Sequence from={0} durationInFrames={90}>
        <Scene1_Title />
      </Sequence>

      {/* Scene 2: Problem (90-210 frames = 3-7 seconds) */}
      <Sequence from={90} durationInFrames={120}>
        <Scene2_Problem />
      </Sequence>

      {/* Scene 3: Solution (210-330 frames = 7-11 seconds) */}
      <Sequence from={210} durationInFrames={120}>
        <Scene3_Solution />
      </Sequence>

      {/* Scene 4: Tokens (330-390 frames = 11-13 seconds) */}
      <Sequence from={330} durationInFrames={60}>
        <Scene4_Tokens />
      </Sequence>

      {/* Scene 5: CTA (390-450 frames = 13-15 seconds) */}
      <Sequence from={390} durationInFrames={60}>
        <Scene5_CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
