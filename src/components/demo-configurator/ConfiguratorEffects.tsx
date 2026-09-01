import { useEffect, useRef } from "react";
import { Application, Container, Graphics } from "pixi.js";

interface ConfiguratorEffectsProps {
  pulseKey: number;
  colour: number;
  target: HTMLButtonElement | null;
}

interface FlowParticle {
  graphic: Graphics;
  offset: number;
  lane: number;
  speed: number;
  phase: number;
}

interface ActivePulse {
  root: Container;
  mask: Graphics;
  glow: Graphics;
  particles: FlowParticle[];
  elapsed: number;
  duration: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EffectsApi {
  pulse: (colour: number, target: HTMLButtonElement) => void;
}

export default function ConfiguratorEffects({
  pulseKey,
  colour,
  target,
}: ConfiguratorEffectsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<EffectsApi | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let app: Application | null = null;

    const initialise = async () => {
      const instance = new Application();
      await instance.init({
        canvas,
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio, 1.25),
        preference: "webgl",
        powerPreference: "high-performance",
      });

      if (disposed) {
        instance.destroy();
        return;
      }

      app = instance;
      instance.ticker.maxFPS = 30;
      const activePulses: ActivePulse[] = [];

      const pulse = (pulseColour: number, pulseTarget: HTMLButtonElement) => {
        const hostBounds = host.getBoundingClientRect();
        const targetBounds = pulseTarget.getBoundingClientRect();
        const x = targetBounds.left - hostBounds.left;
        const y = targetBounds.top - hostBounds.top;
        const width = targetBounds.width;
        const height = targetBounds.height;

        if (width <= 0 || height <= 0) return;

        const root = new Container();
        const mask = new Graphics()
          .roundRect(x, y, width, height, Math.min(14, height * 0.2))
          .fill({ color: 0xffffff });
        const glow = new Graphics()
          .roundRect(x, y, width, height, Math.min(14, height * 0.2))
          .fill({ color: pulseColour, alpha: 0.095 });
        const particleCount = Math.max(
          20,
          Math.min(34, Math.round(width / 22)),
        );
        const particles: FlowParticle[] = Array.from(
          { length: particleCount },
          (_, index) => {
            const radius =
              index % 6 === 0 ? 2.5 : index % 3 === 0 ? 1.8 : 1.35;
            const graphic = new Graphics().circle(0, 0, radius).fill({
              color: pulseColour,
              alpha: 0.88,
            });
            root.addChild(graphic);
            return {
              graphic,
              offset: index / particleCount,
              lane: ((index * 7) % 11) / 10,
              speed: 0.12 + (index % 5) * 0.025,
              phase: index * 1.37,
            };
          },
        );

        root.addChildAt(glow, 0);
        root.mask = mask;
        instance.stage.addChild(mask);
        instance.stage.addChild(root);
        activePulses.push({
          root,
          mask,
          glow,
          particles,
          elapsed: 0,
          duration: 1.25,
          x,
          y,
          width,
          height,
        });
        instance.start();
      };

      apiRef.current = { pulse };

      instance.ticker.add((ticker) => {
        const delta = Math.min(ticker.deltaMS / 1000, 0.08);

        for (let index = activePulses.length - 1; index >= 0; index -= 1) {
          const effect = activePulses[index];
          effect.elapsed += delta;
          const time = Math.min(effect.elapsed / effect.duration, 1);
          const envelope = Math.sin(time * Math.PI);
          effect.glow.alpha = envelope * 0.9;

          effect.particles.forEach((particle, particleIndex) => {
            const progress =
              (particle.offset + time * (0.72 + particle.speed)) % 1;
            const wave =
              Math.sin(time * Math.PI * 2 + particle.phase) *
              effect.height *
              0.07;
            particle.graphic.position.set(
              effect.x + effect.width * (0.08 + progress * 0.84),
              effect.y + effect.height * (0.25 + particle.lane * 0.5) + wave,
            );
            particle.graphic.alpha =
              Math.sin(progress * Math.PI) * envelope * 0.78;
            particle.graphic.scale.set(
              0.8 +
                Math.sin(time * Math.PI + particleIndex * 0.55) * 0.12,
            );
          });

          if (time >= 1) {
            instance.stage.removeChild(effect.root);
            instance.stage.removeChild(effect.mask);
            effect.root.destroy({ children: true });
            effect.mask.destroy();
            activePulses.splice(index, 1);
          }
        }

        if (activePulses.length === 0) instance.stop();
      });

      instance.stop();
    };

    void initialise();

    return () => {
      disposed = true;
      apiRef.current = null;
      app?.stop();
      app?.destroy();
      app = null;
    };
  }, []);

  useEffect(() => {
    if (pulseKey > 0 && target) apiRef.current?.pulse(colour, target);
  }, [pulseKey, colour, target]);

  return (
    <div ref={hostRef} className="configurator-effects" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
