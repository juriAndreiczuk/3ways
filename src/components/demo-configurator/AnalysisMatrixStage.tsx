import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { getVisualCategory, type VisualCategoryId } from "./visualCategories";

interface AnalysisMatrixStageProps {
  categoryId: VisualCategoryId;
  phase: number;
}

interface MatrixApi {
  setPhase: (phase: number) => void;
}

interface MatrixCell {
  group: THREE.Group;
  fill: THREE.MeshBasicMaterial;
  edge: THREE.LineBasicMaterial;
  detail: THREE.LineBasicMaterial;
  finalist: boolean;
  primary: boolean;
}

function createLabelTexture(label: string, colour: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = colour;
    context.font = "700 28px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, 64, 34);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function AnalysisMatrixStage({
  categoryId,
  phase,
}: AnalysisMatrixStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<MatrixApi | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const category = getVisualCategory(categoryId);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.15, 7.4);

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
    renderer.toneMappingExposure = 1.2;

    const root = new THREE.Group();
    root.rotation.set(-0.06, -0.08, 0);
    scene.add(root);

    const state = { analysis: 0, final: 0, scannerX: -2.45 };
    const finalistIndices = new Set([1, 5, 9, 13]);
    const primaryIndex = 9;
    const cells: MatrixCell[] = [];

    for (let column = 0; column < 5; column += 1) {
      for (let row = 0; row < 3; row += 1) {
        const index = column * 3 + row;
        const group = new THREE.Group();
        group.position.set((column - 2) * 0.84, (1 - row) * 0.61, 0);

        const geometry = new THREE.BoxGeometry(0.62, 0.4, 0.045);
        const fill = new THREE.MeshBasicMaterial({
          color: category.colour,
          transparent: true,
          opacity: 0.075,
          depthWrite: false,
        });
        const panel = new THREE.Mesh(geometry, fill);
        group.add(panel);

        const edge = new THREE.LineBasicMaterial({
          color: category.colour,
          transparent: true,
          opacity: 0.34,
        });
        group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edge));

        const detail = new THREE.LineBasicMaterial({
          color: category.colour,
          transparent: true,
          opacity: 0.18,
        });
        const detailGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.2, 0.07, 0.027),
          new THREE.Vector3(0.18 - row * 0.035, 0.07, 0.027),
          new THREE.Vector3(-0.2, -0.07, 0.027),
          new THREE.Vector3(0.08 + column * 0.018, -0.07, 0.027),
        ]);
        group.add(new THREE.LineSegments(detailGeometry, detail));

        root.add(group);
        cells.push({
          group,
          fill,
          edge,
          detail,
          finalist: finalistIndices.has(index),
          primary: index === primaryIndex,
        });
      }
    }

    for (let column = 0; column < 5; column += 1) {
      const material = new THREE.SpriteMaterial({
        map: createLabelTexture(`0${column + 1}`, column === 2 ? "#d9ccff" : "#777590"),
        transparent: true,
        opacity: column === 2 ? 0.82 : 0.52,
        depthTest: false,
      });
      const label = new THREE.Sprite(material);
      label.position.set((column - 2) * 0.84, 1.68, 0.02);
      label.scale.set(0.34, 0.17, 1);
      root.add(label);
    }

    const scannerMaterial = new THREE.MeshBasicMaterial({
      color: 0x20d9ff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const scanner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 2.55),
      scannerMaterial,
    );
    scanner.position.set(state.scannerX, 0, 0.14);
    root.add(scanner);

    const scannerCoreMaterial = new THREE.LineBasicMaterial({
      color: 0xbaf6ff,
      transparent: true,
      opacity: 0.72,
    });
    const scannerCoreGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.28, 0.15),
      new THREE.Vector3(0, 1.28, 0.15),
    ]);
    const scannerCore = new THREE.Line(scannerCoreGeometry, scannerCoreMaterial);
    scanner.add(scannerCore);

    const scannerTween = gsap.fromTo(
      state,
      { scannerX: -2.45 },
      {
        scannerX: 2.45,
        duration: 1.65,
        ease: "none",
        repeat: -1,
        yoyo: true,
      },
    );

    let destroyed = false;
    let lastFrame = 0;
    const setPhase = (nextPhase: number) => {
      if (nextPhase === 1) {
        gsap.to(state, {
          analysis: 1,
          duration: 0.72,
          ease: "power2.out",
        });
        gsap.to(scannerTween, { timeScale: 1.28, duration: 0.4 });
      }
      if (nextPhase >= 2) {
        gsap.to(state, {
          analysis: 1,
          final: 1,
          duration: 0.82,
          ease: "power3.inOut",
        });
        gsap.to(scannerMaterial, { opacity: 0, duration: 0.55 });
        gsap.to(scannerCoreMaterial, { opacity: 0, duration: 0.55 });
        gsap.to(scannerTween, { timeScale: 0.2, duration: 0.55 });
      }
    };
    apiRef.current = { setPhase };
    setPhase(phase);

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
      lastFrame = time;
      scanner.position.x = state.scannerX;

      cells.forEach((cell) => {
        const distance = Math.abs(cell.group.position.x - state.scannerX);
        const scanned = Math.max(0, 1 - distance * 2.8);
        const finalistBoost = cell.finalist ? state.analysis : 0;
        const rejectedFade = cell.finalist ? 0 : state.analysis * 0.72;
        const finalFade = cell.finalist ? 0 : state.final * 0.22;

        cell.fill.opacity = Math.max(
          0.02,
          0.075 + scanned * 0.24 + finalistBoost * 0.12 - rejectedFade * 0.08 - finalFade,
        );
        cell.edge.opacity = Math.max(
          0.035,
          0.34 + scanned * 0.42 + finalistBoost * 0.35 - rejectedFade * 0.34 - finalFade,
        );
        cell.detail.opacity = Math.max(
          0.02,
          0.18 + scanned * 0.34 + finalistBoost * 0.2 - rejectedFade * 0.2 - finalFade,
        );
        const targetScale = cell.primary
          ? 1 + state.final * 0.2
          : cell.finalist
            ? 1 + state.final * 0.08
            : 1 - state.final * 0.16;
        cell.group.scale.setScalar(targetScale + scanned * 0.035 * (1 - state.final));
        cell.group.position.z = cell.primary ? state.final * 0.18 : cell.finalist ? state.final * 0.08 : 0;
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
      scannerTween.kill();
      gsap.killTweensOf(state);
      stopRendering();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      scene.traverse((object) => {
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
          return;
        }
        if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.LineSegments) && !(object instanceof THREE.Line)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
    };
  }, [categoryId]);

  useEffect(() => {
    apiRef.current?.setPhase(phase);
  }, [phase]);

  return (
    <div ref={hostRef} className="analysis-matrix-stage" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
