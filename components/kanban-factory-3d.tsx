"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type KanbanFactory3DProps = {
  inProgressCount: number;
  completedCount: number;
  selectedDateLabel: string;
  pulseKey?: number;
};

export default function KanbanFactory3D({
  inProgressCount,
  completedCount,
  selectedDateLabel,
  pulseKey = 0,
}: KanbanFactory3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const countsRef = useRef({ inProgressCount, completedCount });
  const boostRef = useRef(0);

  useEffect(() => {
    countsRef.current = { inProgressCount, completedCount };
    boostRef.current = performance.now() + 900;
  }, [inProgressCount, completedCount, pulseKey]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 220;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();

    const baseFrustumHeight = 5.4;
    const minSceneWidth = 7.4;
    const getCameraBounds = (w: number, h: number) => {
      const aspect = Math.max(w / Math.max(h, 1), 0.5);
      const frustumHeight = Math.max(baseFrustumHeight, minSceneWidth / aspect);
      const frustumWidth = frustumHeight * aspect;
      return {
        left: -frustumWidth / 2,
        right: frustumWidth / 2,
        top: frustumHeight / 2,
        bottom: -frustumHeight / 2,
      };
    };

    const initialBounds = getCameraBounds(width, height);
    const camera = new THREE.OrthographicCamera(
      initialBounds.left,
      initialBounds.right,
      initialBounds.top,
      initialBounds.bottom,
      0.1,
      100,
    );
    camera.position.set(6.5, 5.6, 6.8);
    camera.lookAt(0, 0.25, 0);

    // Lighting for bold cartoon shading
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(6, 10, 5);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xff90b8, 0.65);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    const addOutline = (mesh: THREE.Mesh, color = 0x141414) => {
      const edges = new THREE.EdgesGeometry(mesh.geometry, 25);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color }),
      );
      mesh.add(line);
    };

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Base platform (blue arcade deck)
    const deckGeo = new THREE.BoxGeometry(6.2, 0.42, 3.6);
    const deckMat = new THREE.MeshToonMaterial({ color: 0x1e5eff });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, -1.15, 0);
    addOutline(deck);
    rootGroup.add(deck);

    // Center Yellow Factory Cube (MasterGo style)
    const factoryGeo = new THREE.BoxGeometry(2.15, 1.75, 2.05);
    const factoryMat = new THREE.MeshToonMaterial({ color: 0xffd400 });
    const factory = new THREE.Mesh(factoryGeo, factoryMat);
    factory.position.set(0, -0.05, -0.1);
    addOutline(factory);
    rootGroup.add(factory);

    // Front conveyor mouth on the yellow cube
    const mouthGeo = new THREE.BoxGeometry(0.95, 0.62, 0.22);
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x141414 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.32, 0.96);
    rootGroup.add(mouth);

    // Conveyor belt tongue coming out of the mouth
    const beltGeo = new THREE.BoxGeometry(0.84, 0.14, 1.35);
    const beltMat = new THREE.MeshToonMaterial({ color: 0xffd400 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(0, -0.58, 1.45);
    belt.rotation.x = 0.14;
    addOutline(belt);
    rootGroup.add(belt);

    // Pink Dome on top of Factory
    const domeBaseGeo = new THREE.CylinderGeometry(0.82, 0.88, 0.22, 24);
    const domeBaseMat = new THREE.MeshToonMaterial({ color: 0xff90b8 });
    const domeBase = new THREE.Mesh(domeBaseGeo, domeBaseMat);
    domeBase.position.set(0, 0.92, -0.1);
    addOutline(domeBase);
    rootGroup.add(domeBase);

    const domeGeo = new THREE.SphereGeometry(
      0.78,
      24,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.58,
    );
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xff90b8,
      transparent: true,
      opacity: 0.58,
      roughness: 0.15,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 0.98, -0.1);
    rootGroup.add(dome);

    // Core spinning crystal inside dome
    const coreGeo = new THREE.OctahedronGeometry(0.42, 0);
    const coreMat = new THREE.MeshToonMaterial({ color: 0x1e5eff });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 1.32, -0.1);
    addOutline(coreMesh);
    rootGroup.add(coreMesh);

    // Left Tube: DIKERJAKAN (In-Progress Tower)
    const leftTowerGroup = new THREE.Group();
    leftTowerGroup.position.set(-2.15, -0.15, 0.1);
    rootGroup.add(leftTowerGroup);

    const leftBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.74, 0.34, 20),
      new THREE.MeshToonMaterial({ color: 0xff90b8 }),
    );
    leftBase.position.y = -0.62;
    addOutline(leftBase);
    leftTowerGroup.add(leftBase);

    const leftGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.58, 1.65, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0xffd400,
        transparent: true,
        opacity: 0.45,
        roughness: 0.2,
      }),
    );
    leftGlass.position.y = 0.35;
    leftTowerGroup.add(leftGlass);

    const leftCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.64, 0.64, 0.24, 20),
      new THREE.MeshToonMaterial({ color: 0x1e5eff }),
    );
    leftCap.position.y = 1.28;
    addOutline(leftCap);
    leftTowerGroup.add(leftCap);

    // Right Tube: SELESAI (Completed Tower)
    const rightTowerGroup = new THREE.Group();
    rightTowerGroup.position.set(2.15, -0.15, 0.1);
    rootGroup.add(rightTowerGroup);

    const rightBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.74, 0.34, 20),
      new THREE.MeshToonMaterial({ color: 0x1e5eff }),
    );
    rightBase.position.y = -0.62;
    addOutline(rightBase);
    rightTowerGroup.add(rightBase);

    const rightGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.58, 1.65, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0x58b978,
        transparent: true,
        opacity: 0.48,
        roughness: 0.2,
      }),
    );
    rightGlass.position.y = 0.35;
    rightTowerGroup.add(rightGlass);

    const rightCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.64, 0.64, 0.24, 20),
      new THREE.MeshToonMaterial({ color: 0x58b978 }),
    );
    rightCap.position.y = 1.28;
    addOutline(rightCap);
    rightTowerGroup.add(rightCap);

    // Pink connecting pipes between towers and center cube
    const pipeGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.15, 16);
    const pipeMat = new THREE.MeshToonMaterial({ color: 0xff90b8 });

    const leftPipe = new THREE.Mesh(pipeGeo, pipeMat);
    leftPipe.rotation.z = Math.PI / 2;
    leftPipe.position.set(-1.32, -0.25, 0.05);
    addOutline(leftPipe);
    rootGroup.add(leftPipe);

    const rightPipe = new THREE.Mesh(pipeGeo, pipeMat);
    rightPipe.rotation.z = Math.PI / 2;
    rightPipe.position.set(1.32, -0.25, 0.05);
    addOutline(rightPipe);
    rootGroup.add(rightPipe);

    // Front Arcade Red Button pad
    const padBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.24, 0.85),
      new THREE.MeshToonMaterial({ color: 0xffd400 }),
    );
    padBase.position.set(-1.25, -0.82, 1.25);
    addOutline(padBase);
    rootGroup.add(padBase);

    const arcadeBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 0.22, 20),
      new THREE.MeshToonMaterial({ color: 0xff3b30 }),
    );
    arcadeBtn.position.set(-1.25, -0.62, 1.25);
    addOutline(arcadeBtn);
    rootGroup.add(arcadeBtn);

    // Dynamic capsules inside Left (Dikerjakan) & Right (Selesai) towers
    const capsuleGeo = new THREE.SphereGeometry(0.19, 16, 16);
    const inProgressCapsules: THREE.Mesh[] = [];
    const completedCapsules: THREE.Mesh[] = [];

    const leftColors = [0xffd400, 0x1e5eff, 0xff90b8];
    const rightColors = [0x58b978, 0xffd400, 0xffffff];

    for (let i = 0; i < 6; i++) {
      const leftOrb = new THREE.Mesh(
        capsuleGeo,
        new THREE.MeshToonMaterial({ color: leftColors[i % leftColors.length] }),
      );
      addOutline(leftOrb);
      leftTowerGroup.add(leftOrb);
      inProgressCapsules.push(leftOrb);

      const rightOrb = new THREE.Mesh(
        capsuleGeo,
        new THREE.MeshToonMaterial({ color: rightColors[i % rightColors.length] }),
      );
      addOutline(rightOrb);
      rightTowerGroup.add(rightOrb);
      completedCapsules.push(rightOrb);
    }

    // Conveyor moving capsule
    const conveyorOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshToonMaterial({ color: 0xff90b8 }),
    );
    addOutline(conveyorOrb);
    rootGroup.add(conveyorOrb);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frameId = 0;
    const animate = (now: number) => {
      const t = now * 0.001;
      const isBoosted = now < boostRef.current;
      const speedMultiplier = isBoosted ? 3.2 : 1;

      const { inProgressCount: activeCount, completedCount: doneCount } =
        countsRef.current;

      // Update visible capsules in Left Tower (Dikerjakan)
      const visibleActive = Math.min(activeCount, inProgressCapsules.length);
      inProgressCapsules.forEach((orb, idx) => {
        orb.visible = idx < visibleActive;
        if (orb.visible) {
          const angle = t * 1.8 * speedMultiplier + idx * 1.1;
          const radius = 0.18;
          orb.position.set(
            Math.cos(angle) * radius,
            -0.25 + idx * 0.24 + (prefersReducedMotion ? 0 : Math.sin(t * 3 + idx) * 0.05),
            Math.sin(angle) * radius,
          );
        }
      });

      // Update visible capsules in Right Tower (Selesai)
      const visibleDone = Math.min(doneCount, completedCapsules.length);
      completedCapsules.forEach((orb, idx) => {
        orb.visible = idx < visibleDone;
        if (orb.visible) {
          const angle = -t * 1.4 * speedMultiplier + idx * 1.1;
          const radius = 0.16;
          orb.position.set(
            Math.cos(angle) * radius,
            -0.25 + idx * 0.24 + (prefersReducedMotion ? 0 : Math.cos(t * 2.5 + idx) * 0.04),
            Math.sin(angle) * radius,
          );
        }
      });

      if (!prefersReducedMotion) {
        coreMesh.rotation.y = t * 1.6 * speedMultiplier;
        coreMesh.rotation.x = Math.sin(t * 1.2) * 0.35;
        rootGroup.rotation.y = Math.sin(t * 0.55) * 0.12;

        // Arcade button press animation on boost
        arcadeBtn.position.y = isBoosted
          ? -0.69 + Math.sin(t * 20) * 0.02
          : -0.62;

        // Conveyor capsule rolling out of the factory mouth
        const cycle = (t * 0.85 * speedMultiplier) % 1;
        conveyorOrb.position.set(0, -0.36 - cycle * 0.18, 0.92 + cycle * 0.95);
        conveyorOrb.rotation.x = t * 4;
      } else {
        conveyorOrb.position.set(0, -0.45, 1.35);
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const nextWidth = container.clientWidth || 320;
      const nextHeight = container.clientHeight || 220;
      const bounds = getCameraBounds(nextWidth, nextHeight);
      camera.left = bounds.left;
      camera.right = bounds.right;
      camera.top = bounds.top;
      camera.bottom = bounds.bottom;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => handleResize())
        : null;
    resizeObserver?.observe(container);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      rootGroup.traverse((obj) => {
        if ("geometry" in obj && obj.geometry instanceof THREE.BufferGeometry) {
          obj.geometry.dispose();
        }
        if ("material" in obj && obj.material) {
          const materials = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          materials.forEach((mat) => mat.dispose());
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="factory-3d-card">
      <div className="factory-3d-header">
        <span className="factory-badge">3D KANBAN FACTORY</span>
        <span className="factory-date-tag">{selectedDateLabel}</span>
      </div>

      <div className="factory-3d-stage-wrap">
        <div
          aria-label="Mesin 3D Kanban Todo"
          className="factory-3d-canvas"
          ref={mountRef}
          role="img"
        >
          <div className="factory-3d-fallback">
            <Image
              alt="Tabung kapsul todo"
              height={120}
              src="/assets/capsule-tube.svg"
              width={90}
            />
          </div>
        </div>

        <button
          aria-label="Tekan tombol mesin arkade 3D"
          className="factory-play-btn"
          onClick={() => {
            boostRef.current = performance.now() + 1200;
          }}
          type="button"
        >
          <span>BOOST MESIN</span>
        </button>
      </div>

      <div className="factory-3d-legend">
        <div className="legend-pill legend-working">
          <span className="legend-dot" />
          <span>TABUNG KIRI: {inProgressCount} DIKERJAKAN</span>
        </div>
        <div className="legend-pill legend-done">
          <span className="legend-dot" />
          <span>TABUNG KANAN: {completedCount} SELESAI</span>
        </div>
      </div>
    </div>
  );
}
