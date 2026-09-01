import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import {
  getVisualCategory,
  visualCategories,
  type VisualCategoryId,
} from "./visualCategories";

type StageVariant = "start" | "routing" | "companion" | "processing";

interface GlassCubeStageProps {
  variant: StageVariant;
  categoryIds?: VisualCategoryId[];
  categoryId?: VisualCategoryId | null;
  selectedCategoryId?: VisualCategoryId | null;
  hoveredCategoryId?: VisualCategoryId | null;
  layers?: number;
  startHovered?: boolean;
  startActive?: boolean;
  onStartComplete?: () => void;
  onSelectionComplete?: () => void;
}

interface CubeUnit {
  group: THREE.Group;
  glass: THREE.MeshPhysicalMaterial;
  edge: THREE.LineBasicMaterial;
  icon: THREE.SpriteMaterial | null;
}

interface StageApi {
  select: (categoryId: VisualCategoryId) => void;
  hover: (categoryId: VisualCategoryId | null) => void;
  setLayers: (layers: number) => void;
  setStartHover: (hovered: boolean) => void;
  activateStart: () => void;
}

function createIconTexture(path: string): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#ffffff";
    context.fill(new Path2D(path));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCubeUnit(colour: number, size = 1.35, iconPath?: string): CubeUnit {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(size, size, size, 2, 2, 2);
  const glass = new THREE.MeshPhysicalMaterial({
    color: colour,
    emissive: colour,
    emissiveIntensity: 0.12,
    metalness: 0.08,
    roughness: 0.16,
    transmission: 0.68,
    thickness: 1.2,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const cube = new THREE.Mesh(geometry, glass);
  cube.renderOrder = 2;
  group.add(cube);

  const edge = new THREE.LineBasicMaterial({
    color: colour,
    transparent: true,
    opacity: 0.88,
  });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edge);
  edges.renderOrder = 3;
  group.add(edges);

  let icon: THREE.SpriteMaterial | null = null;
  if (iconPath) {
    icon = new THREE.SpriteMaterial({
      map: createIconTexture(iconPath),
      color: colour,
      transparent: true,
      opacity: 0.96,
      depthTest: false,
      depthWrite: false,
    });
    const iconSprite = new THREE.Sprite(icon);
    iconSprite.name = "category-icon";
    iconSprite.scale.set(size * 0.58, size * 0.58, 1);
    iconSprite.renderOrder = 1;
    group.add(iconSprite);
  }

  return { group, glass, edge, icon };
}

export default function GlassCubeStage({
  variant,
  categoryIds = [],
  categoryId = null,
  selectedCategoryId = null,
  hoveredCategoryId = null,
  layers = 0,
  startHovered = false,
  startActive = false,
  onStartComplete,
  onSelectionComplete,
}: GlassCubeStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<StageApi | null>(null);
  const completionRef = useRef(onSelectionComplete);
  const startCompletionRef = useRef(onStartComplete);
  const categoryIdsKey = categoryIds.join("|");

  useEffect(() => {
    completionRef.current = onSelectionComplete;
  }, [onSelectionComplete]);

  useEffect(() => {
    startCompletionRef.current = onStartComplete;
  }, [onStartComplete]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(
      0,
      variant === "companion" ? 0.1 : variant === "start" ? 0 : 0.5,
      variant === "routing" ? 11 : variant === "start" ? 6.2 : 7.2,
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene.add(new THREE.AmbientLight(0x9aa2ff, 1.15));
    const keyLight = new THREE.PointLight(0xb27cff, 9, 20);
    keyLight.position.set(-4, 4, 5);
    scene.add(keyLight);
    const cyanLight = new THREE.PointLight(0x28dfff, 8, 18);
    cyanLight.position.set(4, -2, 4);
    scene.add(cyanLight);

    const root = new THREE.Group();
    scene.add(root);
    const cubeUnits: CubeUnit[] = [];
    const plates: THREE.Mesh[] = [];
    const processingNodes: THREE.Mesh[] = [];
    const startFrames: THREE.LineSegments[] = [];

    if (variant === "routing") {
      const routingCategories = categoryIds.length
        ? categoryIds.map((id) => getVisualCategory(id))
        : visualCategories.slice(0, 5);
      routingCategories.forEach((category, index) => {
        const unit = createCubeUnit(category.colour, 1.3, category.iconPath);
        unit.group.position.set((index - 2) * 4.35, 0.7, index % 2 === 0 ? 0 : -0.2);
        unit.group.rotation.set(0.18 + index * 0.025, 0.4 - index * 0.13, 0.08);
        unit.group.userData.baseX = unit.group.position.x;
        unit.group.userData.categoryId = category.id;
        root.add(unit.group);
        cubeUnits.push(unit);
      });
    } else {
      const category = getVisualCategory(categoryId);
      const unit = createCubeUnit(
        category.colour,
        variant === "companion" ? 1.45 : variant === "start" ? 1.82 : 2.05,
      );
      unit.group.rotation.set(0.28, 0.48, 0.08);
      root.add(unit.group);
      cubeUnits.push(unit);

      if (variant === "start") {
        unit.glass.opacity = 0.4;
        unit.glass.emissiveIntensity = 0.2;

        for (let index = 0; index < 2; index += 1) {
          const size = 2.12 + index * 0.3;
          const frameGeometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(size, size, size),
          );
          const frameMaterial = new THREE.LineBasicMaterial({
            color: category.colour,
            transparent: true,
            opacity: 0.25 - index * 0.055,
          });
          const frame = new THREE.LineSegments(frameGeometry, frameMaterial);
          frame.rotation.set(0.15 + index * 0.17, 0.28 - index * 0.12, index * 0.18);
          frame.userData.baseScale = 1;
          root.add(frame);
          startFrames.push(frame);
        }

      } else if (variant !== "companion") {
        const nodeGeometry = new THREE.SphereGeometry(0.075, 12, 12);
        for (let index = 0; index < 15; index += 1) {
          const isFinalist = index < 4;
          const material = new THREE.MeshBasicMaterial({
            color: isFinalist ? category.colour : 0x61709f,
            transparent: true,
            opacity: isFinalist ? 0.95 : 0.42,
          });
          const node = new THREE.Mesh(nodeGeometry, material);
          node.userData.angle = (index / 15) * Math.PI * 2;
          node.userData.radius = 2.15 + (index % 3) * 0.34;
          node.userData.speed = 0.14 + (index % 5) * 0.018;
          node.userData.finalist = isFinalist;
          root.add(node);
          processingNodes.push(node);
        }
      }
    }

    let destroyed = false;
    let selected = false;
    let startIsHovered = false;
    let startIsActive = false;
    let elapsed = 0;
    let lastFrame = 0;

    const setLayers = (nextLayers: number) => {
      plates.forEach((plate, index) => {
        const visible = index < nextLayers;
        const material = plate.material as THREE.MeshBasicMaterial;
        gsap.to(plate.scale, {
          x: visible ? 1 : 0.01,
          y: visible ? 1 : 0.01,
          z: visible ? 1 : 0.01,
          duration: 0.75,
          ease: "back.out(1.8)",
        });
        gsap.to(material, {
          opacity: visible ? 0.38 + index * 0.06 : 0,
          duration: 0.5,
        });
      });
    };

    const hover = (nextCategoryId: VisualCategoryId | null) => {
      if (variant !== "routing" || selected) return;
      cubeUnits.forEach((unit) => {
        const active = unit.group.userData.categoryId === nextCategoryId;
        gsap.to(unit.group.scale, {
          x: active ? 1.12 : 1,
          y: active ? 1.12 : 1,
          z: active ? 1.12 : 1,
          duration: 0.55,
          ease: "power3.out",
        });
        gsap.to(unit.glass, {
          emissiveIntensity: active ? 0.48 : 0.12,
          opacity: active ? 0.5 : 0.34,
          duration: 0.45,
        });
      });
    };

    const select = (nextCategoryId: VisualCategoryId) => {
      if (variant !== "routing" || selected) return;
      selected = true;
      const chosen = cubeUnits.find(
        (unit) => unit.group.userData.categoryId === nextCategoryId,
      );
      if (!chosen) return;

      cubeUnits.forEach((unit) => {
        const isChosen = unit === chosen;
        if (isChosen) {
          gsap.to(unit.group.scale, {
            x: 1.16,
            y: 1.16,
            z: 1.16,
            duration: 0.72,
            ease: "power3.out",
          });
          gsap.to(unit.glass, {
            opacity: 0.58,
            emissiveIntensity: 0.68,
            duration: 0.62,
          });
        } else {
          gsap.to(unit.group.scale, {
            x: 0.82,
            y: 0.82,
            z: 0.82,
            duration: 0.58,
          });
          gsap.to([unit.glass, unit.edge], {
            opacity: 0.08,
            duration: 0.48,
          });
          if (unit.icon) {
            gsap.to(unit.icon, {
              opacity: 0,
              duration: 0.42,
            });
          }
        }
      });

      gsap.delayedCall(1.15, () => completionRef.current?.());
    };

    const setStartHover = (hovered: boolean) => {
      if (variant !== "start" || startIsActive) return;
      startIsHovered = hovered;
      const unit = cubeUnits[0];
      if (!unit) return;

      gsap.to(unit.group.scale, {
        x: hovered ? 1.1 : 1,
        y: hovered ? 1.1 : 1,
        z: hovered ? 1.1 : 1,
        duration: 0.65,
        ease: "power3.out",
      });
      gsap.to(unit.glass, {
        opacity: hovered ? 0.57 : 0.4,
        emissiveIntensity: hovered ? 0.58 : 0.2,
        duration: 0.55,
      });
      startFrames.forEach((frame, index) => {
        gsap.to(frame.scale, {
          x: hovered ? 1.08 + index * 0.035 : 1,
          y: hovered ? 1.08 + index * 0.035 : 1,
          z: hovered ? 1.08 + index * 0.035 : 1,
          duration: 0.7,
          ease: "power3.out",
        });
        gsap.to(frame.material, {
          opacity: hovered ? 0.42 - index * 0.07 : 0.25 - index * 0.055,
          duration: 0.5,
        });
      });
    };

    const activateStart = () => {
      if (variant !== "start" || startIsActive) return;
      startIsActive = true;
      const unit = cubeUnits[0];
      if (!unit) return;

      const timeline = gsap.timeline({
        onComplete: () => startCompletionRef.current?.(),
      });
      const fadingMaterials: THREE.Material[] = [];
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.LineSegments)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        fadingMaterials.push(...materials);
      });

      timeline
        .to(root.rotation, {
          y: root.rotation.y + 0.48,
          duration: 0.72,
          ease: "power2.inOut",
        }, 0)
        .to(unit.glass, {
          emissiveIntensity: 0.72,
          duration: 0.32,
        }, 0)
        .to(root.scale, {
          x: 0.76,
          y: 0.76,
          z: 0.76,
          duration: 0.72,
          ease: "power2.inOut",
        }, 0)
        .to(fadingMaterials, {
          opacity: 0,
          duration: 0.34,
          ease: "power2.in",
        }, 0.4);
    };

    apiRef.current = { select, hover, setLayers, setStartHover, activateStart };
    setLayers(layers);

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const renderFrame = (time: number) => {
      if (destroyed || time - lastFrame < 1000 / 30) return;
      const delta = Math.min((time - lastFrame) / 1000, 0.08);
      lastFrame = time;
      elapsed += delta;

      cubeUnits.forEach((unit, index) => {
        unit.group.rotation.y += delta * (
          variant === "processing"
            ? 0.34
            : variant === "start"
              ? startIsActive ? 0.56 : startIsHovered ? 0.42 : 0.22
              : 0.18 + index * 0.012
        );
        unit.group.rotation.x += delta * 0.045;
      });

      startFrames.forEach((frame, index) => {
        if (!startIsActive) {
          const speed = startIsHovered ? 0.16 : 0.075;
          frame.rotation.y += delta * speed * (index % 2 === 0 ? 1 : -1);
          frame.rotation.x += delta * speed * 0.42;
        }
      });

      processingNodes.forEach((node, index) => {
        const angle = Number(node.userData.angle) + elapsed * Number(node.userData.speed);
        const settling = Math.min(elapsed / 3.7, 1);
        const finalist = Boolean(node.userData.finalist);
        const baseRadius = Number(node.userData.radius);
        const radius = finalist
          ? THREE.MathUtils.lerp(baseRadius, 1.55 + index * 0.22, settling)
          : THREE.MathUtils.lerp(baseRadius, 3.35, settling);
        node.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.4) * (1.2 - settling * 0.45),
          Math.sin(angle) * 0.65,
        );
        const material = node.material as THREE.MeshBasicMaterial;
        material.opacity = finalist ? 0.72 + settling * 0.28 : 0.42 * (1 - settling * 0.78);
        node.scale.setScalar(finalist ? 1 + settling * 1.15 : 1 - settling * 0.25);
      });

      renderer.render(scene, camera);
    };

    const startRendering = () => renderer.setAnimationLoop(renderFrame);
    const stopRendering = () => renderer.setAnimationLoop(null);
    const handleVisibility = () => (document.hidden ? stopRendering() : startRendering());
    document.addEventListener("visibilitychange", handleVisibility);
    startRendering();

    return () => {
      destroyed = true;
      apiRef.current = null;
      stopRendering();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      gsap.killTweensOf(root.position);
      scene.traverse((object) => {
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
          return;
        }
        if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.LineSegments)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
    };
  }, [variant, categoryId, categoryIdsKey]);

  useEffect(() => {
    if (selectedCategoryId) apiRef.current?.select(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    apiRef.current?.hover(hoveredCategoryId);
  }, [hoveredCategoryId]);

  useEffect(() => {
    apiRef.current?.setLayers(layers);
  }, [layers]);

  useEffect(() => {
    apiRef.current?.setStartHover(startHovered);
  }, [startHovered]);

  useEffect(() => {
    if (startActive) apiRef.current?.activateStart();
  }, [startActive]);

  return (
    <div ref={hostRef} className={`glass-cube-stage glass-cube-stage--${variant}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
