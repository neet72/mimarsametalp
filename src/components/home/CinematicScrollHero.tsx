"use client";

import NextImage from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { localeFromPathname } from "@/lib/locale";

const HERO_IMAGES = [
  "/images/hero-1.webp",
  "/images/hero-2.webp",
  "/images/hero-3.webp",
  "/images/hero-4.webp",
  "/images/hero-5.webp",
  "/images/hero-6.webp",
  "/images/hero-7.webp",
  "/images/hero-8.webp",
  "/images/hero-9.webp",
] as const;

type Vec3 = { x: number; y: number; z: number };

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = w / h;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = img.naturalWidth;
  let sourceHeight = img.naturalHeight;

  if (imgRatio > canvasRatio) {
    sourceWidth = img.naturalHeight * canvasRatio;
    sourceX = (img.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = img.naturalWidth / canvasRatio;
    sourceY = (img.naturalHeight - sourceHeight) / 2;
  }

  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, w, h);
}

export function CinematicScrollHero() {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollSpaceRef = useRef<HTMLDivElement | null>(null);
  const windTopRef = useRef<HTMLCanvasElement | null>(null);
  const windBottomRef = useRef<HTMLCanvasElement | null>(null);

  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);

  const sources = useMemo(() => [...HERO_IMAGES], []);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const activeSrc = lightboxIndex == null ? null : sources[lightboxIndex];

  const lightboxImageAlt = useMemo(() => {
    if (lightboxIndex == null) return "";
    const i = lightboxIndex + 1;
    const n = sources.length;
    return locale === "en"
      ? `Samet Alp Architecture — portfolio render ${i} of ${n}`
      : `Samet Alp Mimarlık — portföy render görseli ${i} / ${n}`;
  }, [lightboxIndex, locale, sources.length]);
  const canPrev = lightboxIndex != null && lightboxIndex > 0;
  const canNext = lightboxIndex != null && lightboxIndex < sources.length - 1;

  // Drag adds a temporary rotation offset (radians) on top of GSAP.
  const dragOffsetRadRef = useRef(0);
  const spinVelRef = useRef(0); // rad/s
  const lastSpinMsRef = useRef<number | null>(null);
  const progressRef = useRef(0); // ScrollTrigger progress 0..1
  const effectiveRotYRef = useRef(0); // radians (GSAP rotation + drag)

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const [lightboxDir, setLightboxDir] = useState<-1 | 0 | 1>(0);
  const prevLightbox = useCallback(() => {
    setLightboxDir(-1);
    setLightboxIndex((i) => (i == null ? i : Math.max(0, i - 1)));
  }, []);
  const nextLightbox = useCallback(() => {
    setLightboxDir(1);
    setLightboxIndex((i) => (i == null ? i : Math.min(sources.length - 1, i + 1)));
  }, [sources.length]);

  const onLightboxDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      // Mobile-friendly swipe: low threshold with velocity assist.
      const swipe = info.offset.x + info.velocity.x * 0.18;
      if (swipe < -120) nextLightbox();
      else if (swipe > 120) prevLightbox();
    },
    [nextLightbox, prevLightbox],
  );

  const openLightboxFromCurrent = useCallback(() => {
    if (isDragging) return;
    setLightboxDir(0);
    // Use real-time effective rotation to pick the front-most image deterministically.
    const TWO_PI = Math.PI * 2;
    const n = sources.length;
    if (!n) return;

    // Normalize angle to [0, 1)
    const ang = ((effectiveRotYRef.current % TWO_PI) + TWO_PI) % TWO_PI;
    const phase = ang / TWO_PI;

    // Sample the "center" of a panel rather than its edge.
    const u = (phase + 0.5 / n) % 1;
    const idx = Math.max(0, Math.min(n - 1, Math.floor(u * n)));
    setLightboxIndex(idx);
  }, [isDragging, sources.length]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    if (lightboxIndex == null) return;
    // Mobile-first: prevent background scroll while the lightbox is open.
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [lightboxIndex, closeLightbox, prevLightbox, nextLightbox]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current || !stageRef.current || !canvasRef.current || !scrollSpaceRef.current)
      return;

    gsap.registerPlugin(ScrollTrigger, CustomEase);
    CustomEase.create("cinematicSilk", "0.45, 0.05, 0.55, 0.95");
    CustomEase.create("cinematicSmooth", "0.25, 0.1, 0.25, 1");
    CustomEase.create("cinematicFlow", "0.33, 0, 0.2, 1");
    CustomEase.create("cinematicLinear", "0.4, 0, 0.6, 1");

    const wrapperEl = wrapperRef.current;
    const stageEl = stageRef.current;
    const canvasEl = canvasRef.current;
    const scrollSpaceEl = scrollSpaceRef.current;
    const ctx = gsap.context(() => {
      const inView = { v: true };
      let io: IntersectionObserver | null = null;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      // Mobilde performans için DPR düşür
      const isMobile = window.innerWidth < 768;
      renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#0b0b0c");
      scene.fog = new THREE.Fog(new THREE.Color("#0b0b0c"), 8, 30);

      const camera = new THREE.PerspectiveCamera(isMobile ? 56 : 45, 1, 0.1, 200);

      const key = new THREE.DirectionalLight(0xffffff, 1.05);
      key.position.set(6, 10, 8);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xfff4e6, 0.35);
      fill.position.set(-8, 4, -10);
      scene.add(fill);
      scene.add(new THREE.AmbientLight(0xffffff, 0.28));

      // "Focus light" to brighten the centered (front) area of the strip.
      // We keep it subtly warm so it reads like a spotlight sweep, not a flat exposure bump.
      const focusLight = new THREE.SpotLight(0xfff6ea, isMobile ? 3.0 : 3.6, 28, 0.58, 0.7, 1.0);
      focusLight.position.set(0, 2.2, 7.5);
      focusLight.target.position.set(0, 0.9, 0);
      scene.add(focusLight);
      scene.add(focusLight.target);

      const backGeo = new THREE.PlaneGeometry(80, 80);
      const backMat = new THREE.MeshBasicMaterial({ color: "#070708" });
      const back = new THREE.Mesh(backGeo, backMat);
      back.position.set(0, 0, -50);
      scene.add(back);

      const state = {
        // Slight upward framing so the cylinder feels "larger than the viewport"
        cam: { x: 0, y: isMobile ? 0.62 : 0.75, z: isMobile ? 3.85 : 5.6 } as Vec3,
        target: { x: 0, y: isMobile ? 0.78 : 0.95, z: 0 } as Vec3,
        roll: 0,
      };

      const lookAt = new THREE.Vector3();

      const setSize = () => {
        const rect = stageEl.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      setSize();

      let raf = 0;
      // Avoid THREE.Clock (deprecated). Use a simple RAF timer.
      const startMs = performance.now();

      // Cylinder + atlas (reference "images scroll as one")
      const radius = isMobile ? 3.85 : 4.25;
      const height = isMobile ? 1.75 : 2.05;
      const radialSegments = 128;
      const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height, radialSegments, 1, true);

      const atlasCanvas = document.createElement("canvas");
      const atlasCtx = atlasCanvas.getContext("2d", { alpha: false })!;
      const numImages = sources.length;
      const baseSize = 1024;
      const maxTex = renderer.capabilities.maxTextureSize || 4096;
      const safeLimit = window.innerWidth < 768 ? Math.min(maxTex, 2048) : Math.min(maxTex, 8192);
      const totalWidthOriginal = baseSize * numImages;
      const scale = Math.min(1, safeLimit / totalWidthOriginal);
      atlasCanvas.width = Math.floor(totalWidthOriginal * scale);
      atlasCanvas.height = Math.floor(baseSize * scale);

      const imgs: HTMLImageElement[] = [];

      const loadAll = async () => {
        await Promise.all(
          sources.map(
            (src, idx) =>
              new Promise<void>((resolve, reject) => {
                const img = new window.Image();
                img.decoding = "async";
                img.onload = () => {
                  imgs[idx] = img;
                  resolve();
                };
                img.onerror = () => reject(new Error(`Image failed to load: ${src}`));
                img.src = src;
              }),
          ),
        );
      };

      let atlasTexture: THREE.CanvasTexture | null = null;
      const cylinderMat = new THREE.MeshStandardMaterial({
        roughness: 0.9,
        metalness: 0.02,
        side: THREE.BackSide,
      });
      let cylinder: THREE.Mesh | null = null;

      // Wind streaks as DOM overlay (guaranteed visible, never inside strip)
      const windIntensity = { v: 0.22 };
      let lastVel = 0;
      const windTime = { t: 0 };
      const windPhase = { p: 0 };

      const initWindCanvas = (c: HTMLCanvasElement | null) => {
        if (!c) return null;
        const ctx2d = c.getContext("2d");
        if (!ctx2d) return null;
        return ctx2d;
      };

      const windTopCtx = initWindCanvas(windTopRef.current);
      const windBottomCtx = initWindCanvas(windBottomRef.current);

      type Streak = { x: number; y: number; len: number; speed: number; a: number; w: number };
      const STRIP_TURNS = 2.0; // must match cylinder rotation turns in GSAP timeline
      const makeStreaks = (count: number, heightPx: number): Streak[] => {
        const arr: Streak[] = [];
        for (let i = 0; i < count; i++) {
          const w = isMobile ? 0.42 + Math.random() * 0.58 : 0.8 + Math.random() * 1.6;
          arr.push({
            x: Math.random(),
            y: Math.random() * heightPx,
            len: (isMobile ? 44 : 60) + Math.random() * (isMobile ? 110 : 200),
            speed: 0.25 + Math.random() * 1.25,
            a: 0.12 + Math.random() * 0.35,
            w,
          });
        }
        return arr;
      };

      let topStreaks: Streak[] = [];
      let bottomStreaks: Streak[] = [];

      const resizeWind = () => {
        const rect = stageEl.getBoundingClientRect();
        // Mobilde çizgiler çok "kırılgan" görünebildiği için DPR'ı hafif kısıyoruz:
        // daha az aliasing/flicker, daha yumuşak stroke.
        const dpr = isMobile
          ? Math.min(window.devicePixelRatio || 1, 1.25)
          : Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.floor(rect.width * dpr));
        const hBand = Math.max(1, Math.floor((rect.height * 0.22) * dpr));

        const setup = (c: HTMLCanvasElement | null) => {
          if (!c) return;
          c.width = w;
          c.height = hBand;
        };
        setup(windTopRef.current);
        setup(windBottomRef.current);

        topStreaks = makeStreaks(isMobile ? 9 : 26, hBand);
        bottomStreaks = makeStreaks(isMobile ? 9 : 26, hBand);
      };

      resizeWind();

      const build = () => {
        const totalCanvasWidth = atlasCanvas.width;
        const canvasHeight = atlasCanvas.height;
        imgs.forEach((img, i) => {
          const xStartExact = (i / numImages) * totalCanvasWidth;
          const xEndExact = ((i + 1) / numImages) * totalCanvasWidth;
          const xPos = Math.floor(xStartExact);
          const xEnd = Math.floor(xEndExact);
          const drawWidth = xEnd - xPos;
          drawImageCover(atlasCtx, img, xPos, 0, drawWidth, canvasHeight);
        });

        atlasTexture = new THREE.CanvasTexture(atlasCanvas);
        atlasTexture.colorSpace = THREE.SRGBColorSpace;
        // CanvasTexture orientation fix (prevents upside-down atlas on the cylinder)
        atlasTexture.flipY = true;
        atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
        atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
        atlasTexture.minFilter = THREE.LinearFilter;
        atlasTexture.magFilter = THREE.LinearFilter;
        atlasTexture.generateMipmaps = false;
        atlasTexture.needsUpdate = true;

        cylinderMat.map = atlasTexture;
        cylinderMat.needsUpdate = true;

        cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
        cylinder.rotation.y = 0.5;
        // Push slightly up so it doesn't look "stuck" in the middle
        cylinder.position.y = isMobile ? 0.42 : 0.55;
        scene.add(cylinder);
      };

      const tick = () => {
        raf = window.requestAnimationFrame(tick);
        if (!inView.v) return;
        const time = (performance.now() - startMs) / 1000;
        windTime.t = time;

        // Inertial spin after drag: decays smoothly.
        const nowMs = performance.now();
        if (lastSpinMsRef.current == null) lastSpinMsRef.current = nowMs;
        const dt = Math.min(0.05, (nowMs - lastSpinMsRef.current) / 1000);
        lastSpinMsRef.current = nowMs;
        if (!isDraggingRef.current && Math.abs(spinVelRef.current) > 0.0005) {
          dragOffsetRadRef.current += spinVelRef.current * dt;
          spinVelRef.current *= Math.pow(0.02, dt); // exponential decay to near-zero in ~1s
        }
        // Keep offset bounded.
        if (Math.abs(dragOffsetRadRef.current) > Math.PI * 4) {
          dragOffsetRadRef.current = ((dragOffsetRadRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        }

        if (cylinder) {
          // Keep the cylinder breathing subtly
          cylinder.position.y = (isMobile ? 0.42 : 0.55) + Math.sin(time * 0.35) * (isMobile ? 0.014 : 0.02);
        }

        // Draw wind overlay bands (top & bottom)
        const intensity = windIntensity.v;
        const drawBand = (ctx2d: CanvasRenderingContext2D | null, streaks: Streak[], invert: boolean) => {
          if (!ctx2d || streaks.length === 0) return;
          const w = ctx2d.canvas.width;
          const h = ctx2d.canvas.height;
          ctx2d.clearRect(0, 0, w, h);

          ctx2d.lineCap = "round";
          ctx2d.lineJoin = "round";

          // Soft fade towards the strip edge
          const g = ctx2d.createLinearGradient(0, invert ? h : 0, 0, invert ? 0 : h);
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(0.35, `rgba(255,255,255,${0.06 + intensity * 0.22})`);
          g.addColorStop(1, `rgba(255,255,255,${0.02 + intensity * 0.12})`);

          ctx2d.globalCompositeOperation = "lighter";
          ctx2d.fillStyle = g;

          const speedBase = 0.35 + intensity * 1.6;

          // Curvature to match the strip arc, and lock motion to strip rotation progress.
          // We treat the band as the "outside of the strip": top band sits above the top edge,
          // bottom band sits below the bottom edge.
          const curveAmt = h * (isMobile ? 0.26 : 0.34);
          const edgeMargin = h * (isMobile ? 0.18 : 0.14);
          const edgeRange = h * (isMobile ? 0.34 : 0.42);
          const dragTurns = dragOffsetRadRef.current / (Math.PI * 2);
          const phaseShift = windPhase.p * STRIP_TURNS + dragTurns; // keep in sync with strip rotation + drag

          const edgeY = (xPx: number) => {
            const nx = (xPx / w - 0.5) * 2; // -1..1
            // "Cylinder edge" feel: stronger curvature near sides, flatter near center.
            return curveAmt * (nx * nx);
          };

          const edgeAngle = (xPx: number) => {
            const nx = (xPx / w - 0.5) * 2; // -1..1
            // derivative of curveAmt * nx^2 w.r.t x
            const dydx = (curveAmt * 2 * nx) * (2 / w);
            return Math.atan(dydx);
          };

          for (const s of streaks) {
            s.x += (speedBase * s.speed) / w;
            if (s.x > 1.18) {
              s.x = -0.18 - Math.random() * 0.2;
              s.y = Math.random() * h;
              s.len = (isMobile ? 52 : 60) + Math.random() * (isMobile ? 130 : 220);
              s.a = 0.12 + Math.random() * 0.38;
              s.w = isMobile ? 0.46 + Math.random() * 0.6 : 0.8 + Math.random() * 1.7;
              s.speed = 0.25 + Math.random() * 1.25;
            }

            // Lock streak motion with strip progress so it feels like one piece.
            const phaseX = (s.x + phaseShift) % 1.2;
            const x = phaseX * w;

            const eY = edgeY(x);
            const angle = edgeAngle(x);

            // Place streaks OUTSIDE the strip edge
            const baseBandY = invert
              ? // bottom band: start near top then push downward with curvature
                edgeMargin + eY + (s.y % edgeRange)
              : // top band: start near bottom then pull upward with curvature
                (h - edgeMargin - eY) - (s.y % edgeRange);

            const tilt = (Math.sin(windTime.t * 0.8 + baseBandY * 0.01) * 0.55) * (0.35 + intensity);

            ctx2d.globalAlpha = Math.min(0.9, s.a + intensity * 0.55);
            ctx2d.beginPath();
            // Mobilde daha "ipeksi" görünüm için hafif glow/blur
            if (isMobile) {
              ctx2d.shadowBlur = 2 + intensity * 2.2;
              ctx2d.shadowColor = "rgba(255,255,255,0.22)";
            }
            ctx2d.lineWidth = s.w * (isMobile ? 0.9 : 1);
            ctx2d.strokeStyle = isMobile ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.95)";
            const dx = Math.cos(angle) * s.len;
            const dy = Math.sin(angle) * s.len;
            ctx2d.moveTo(x, baseBandY);
            ctx2d.lineTo(x + dx, baseBandY + dy + tilt);
            ctx2d.stroke();
            if (isMobile) {
              ctx2d.shadowBlur = 0;
            }
          }
          ctx2d.globalAlpha = 1;
          ctx2d.globalCompositeOperation = "source-over";
        };

        drawBand(windTopCtx, topStreaks, false);
        drawBand(windBottomCtx, bottomStreaks, true);

        camera.position.set(state.cam.x, state.cam.y, state.cam.z);
        lookAt.set(state.target.x, state.target.y, state.target.z);
        camera.lookAt(lookAt);
        camera.rotation.z = state.roll;

        // Keep the focus light following the camera/target so the "lit" area stays on the focal image.
        focusLight.position.set(state.cam.x, state.cam.y + 0.85, state.cam.z + 2.8);
        focusLight.target.position.set(state.target.x, state.target.y, state.target.z);
        focusLight.intensity = (isMobile ? 2.8 : 3.4) + intensity * (isMobile ? 0.85 : 1.05);

        // Apply drag rotation offset without fighting GSAP: render with offset, then restore.
        if (cylinder) {
          const baseRot = cylinder.rotation.y;
          effectiveRotYRef.current = baseRot + dragOffsetRadRef.current;
          cylinder.rotation.y = effectiveRotYRef.current;
          renderer.render(scene, camera);
          cylinder.rotation.y = baseRot;
        } else {
          renderer.render(scene, camera);
        }
      };
      tick();

      const scrollLen = Math.max(1, scrollSpaceEl.offsetHeight);
      let tl: gsap.core.Timeline | null = null;
      let disposed = false;

      loadAll()
        .then(() => {
          if (disposed) return;
          build();

          tl = gsap.timeline({
            scrollTrigger: {
              trigger: stageEl,
              start: "top top",
              end: `+=${scrollLen}`,
              // Higher scrub = slower, silkier response to scroll (without adding extra spacer distance).
              scrub: isMobile ? 5.2 : 4.2,
              pin: stageEl,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                progressRef.current = self.progress;
                // Use ScrollTrigger velocity to drive wind presence
                const v = Math.abs(self.getVelocity ? self.getVelocity() : 0);
                lastVel = lastVel * 0.85 + v * 0.15;
                // Normalize
                const normalized = Math.min(1, lastVel / 2500);
                windIntensity.v = 0.18 + normalized * 0.62;
                windPhase.p = self.progress;
              },
            },
          });

          // Cinematic shots (more dynamic again, but bounded so the strip never disappears)
          const baseY = state.cam.y;
          const baseZ = state.cam.z;
          const baseTY = state.target.y;

          tl.to(state.cam, {
            x: 0,
            y: baseY,
            z: baseZ,
            duration: 1,
            ease: "cinematicSilk",
          })
            .to(
              state.target,
              { x: 0, y: baseTY, z: 0, duration: 1, ease: "none" },
              0
            )
            // More vertical motion (reference-like), still bounded:
            .to(state.cam, { x: 2.35, y: baseY + 0.95, z: baseZ - 1.05, duration: 1.2, ease: "cinematicFlow" })
            .to(state.target, { x: 0.45, y: baseTY + 0.35, z: 0, duration: 1.2, ease: "none" }, "<")
            .to(state.cam, { x: -2.95, y: baseY - 0.75, z: baseZ - 1.55, duration: 2.0, ease: "cinematicLinear" })
            .to(state.target, { x: -0.55, y: baseTY - 0.25, z: 0, duration: 2.0, ease: "none" }, "<")
            .to(state.cam, { x: 1.45, y: baseY + 0.35, z: baseZ - 1.15, duration: 3.0, ease: "power1.inOut" })
            .to(state.target, { x: 0.2, y: baseTY + 0.2, z: 0, duration: 3.0, ease: "none" }, "<")
            .to(state.cam, { x: -2.05, y: baseY + 0.6, z: baseZ - 0.65, duration: 1.1, ease: "cinematicSmooth" })
            .to(state.target, { x: -0.25, y: baseTY + 0.25, z: 0, duration: 1.1, ease: "none" }, "<");

          if (cylinder) {
            tl.to(
              cylinder.rotation,
              { y: `+=${Math.PI * 2 * 2.0}`, duration: 8.5, ease: "none" },
              0,
            );
          }
        })
        .catch(() => {
          // ignore, do not break page scroll
        });

      const onResize = () => {
        setSize();
        resizeWind();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      // Pause rendering when the hero is offscreen (big perf win on mobile).
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(
          (entries) => {
            const e = entries[0];
            if (!e) return;
            inView.v = e.isIntersecting || e.intersectionRatio > 0;
          },
          { root: null, threshold: [0, 0.01, 0.1] },
        );
        io.observe(stageEl);
      }

      return () => {
        disposed = true;
        window.removeEventListener("resize", onResize);
        io?.disconnect();
        io = null;
        tl?.kill();
        window.cancelAnimationFrame(raf);

        cylinderGeo.dispose();
        backGeo.dispose();
        backMat.dispose();

        cylinderMat.dispose();
        atlasTexture?.dispose();
        if (cylinder) {
          scene.remove(cylinder);
          cylinder = null;
        }
        renderer.dispose();
      };
    }, wrapperEl);

    return () => {
      ctx.revert();
    };
  }, [sources]);

  return (
    <section
      id="home-hero"
      ref={(el) => {
        wrapperRef.current = el;
      }}
      className="w-full bg-surface"
      aria-label="Cinematic 3D hero"
    >
      {/* Kabuktan çıkarılmış: sahne artık full-viewport */}
      <div
        ref={stageRef}
        id="hero-3d-canvas"
        className={cn(
          "relative w-full overflow-hidden bg-[#0b0b0c]",
          "h-[100svh] min-h-[480px] sm:min-h-[560px]",
        )}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* Drag overlay (does not block buttons) */}
        <motion.div
          role="region"
          tabIndex={-1}
          aria-label={
            locale === "en"
              ? "Interactive 3D project ribbon — drag sideways to rotate, click to enlarge"
              : "Etkileşimli 3D proje şeridi — yatay sürükleyerek döndürün, büyütmek için tıklayın"
          }
          className="absolute inset-0 z-[3]"
          drag={reduceMotion ? false : "x"}
          // Keep overlay in place; we only use drag events (no "wall" feel).
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDragStart={() => setIsDragging(true)}
          onDrag={(_, info) => {
            // Accumulate rotation freely (no clamp). deltaX -> radians
            dragOffsetRadRef.current += -info.delta.x * 0.0042;
          }}
          onDragEnd={(_, info) => {
            // Momentum: px/s -> rad/s
            spinVelRef.current = -info.velocity.x * 0.0042;
            window.setTimeout(() => setIsDragging(false), 120);
          }}
          onClick={() => {
            if (isDraggingRef.current) return;
            openLightboxFromCurrent();
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.26),transparent_58%)] mix-blend-screen opacity-85"
        />

        {/* Wind overlay bands (top/bottom), outside the strip */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
          <canvas
            ref={windTopRef}
            className="absolute left-0 right-0 top-0 h-[16%] w-full opacity-85 mix-blend-screen sm:h-[22%] sm:opacity-90"
          />
          <canvas
            ref={windBottomRef}
            className="absolute left-0 right-0 bottom-0 h-[16%] w-full opacity-85 mix-blend-screen sm:h-[22%] sm:opacity-90"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("home-content-start");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={cn(
            "absolute bottom-6 right-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full",
            "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm",
            "transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
          aria-label={locale === "en" ? "Scroll to content" : "İçeriğe geç"}
        >
          <span aria-hidden className="text-lg leading-none">
            ↓
          </span>
        </button>
      </div>

      {/* Scroll spacer: pin burada bitecek, sayfa akacak */}
      <div ref={scrollSpaceRef} aria-hidden className="h-[18vh]" />

      <AnimatePresence>
        {activeSrc ? (
          <motion.div
            key="hero-lightbox"
            className="fixed inset-0 z-[500] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={locale === "en" ? "Image viewer" : "Görsel görüntüleyici"}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={closeLightbox}
              aria-label={locale === "en" ? "Close" : "Kapat"}
            />

            <button
              type="button"
              onClick={closeLightbox}
              className={cn(
                "touch-manipulation absolute right-4 top-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full sm:right-5 sm:top-5",
                "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm",
                "transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
              style={{
                top: "max(1rem, env(safe-area-inset-top))",
                right: "max(1rem, env(safe-area-inset-right))",
              }}
              aria-label={locale === "en" ? "Close" : "Kapat"}
            >
              <X className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={prevLightbox}
              disabled={!canPrev}
              className={cn(
                "touch-manipulation absolute left-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full sm:left-4",
                "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm",
                "transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                !canPrev && "pointer-events-none opacity-0",
              )}
              style={{ left: "max(0.75rem, env(safe-area-inset-left))" }}
              aria-label={locale === "en" ? "Previous image" : "Önceki görsel"}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={nextLightbox}
              disabled={!canNext}
              className={cn(
                "touch-manipulation absolute right-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full sm:right-4",
                "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm",
                "transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                !canNext && "pointer-events-none opacity-0",
              )}
              style={{ right: "max(0.75rem, env(safe-area-inset-right))" }}
              aria-label={locale === "en" ? "Next image" : "Sonraki görsel"}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <motion.div
              className="relative z-[1] mx-auto w-[min(1200px,92vw)]"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={cn(
                  "relative h-[80vh] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 sm:h-[78vh]",
                  "shadow-[0_18px_70px_-22px_rgb(0_0_0/0.7)]",
                  // Better gesture handling on mobile (we handle swipe ourselves).
                  "touch-none",
                )}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={activeSrc}
                    className="absolute inset-0"
                    drag={reduceMotion ? false : "x"}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.08}
                    dragMomentum={true}
                    onDragEnd={reduceMotion ? undefined : onLightboxDragEnd}
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            x: lightboxDir === 0 ? 0 : lightboxDir > 0 ? 28 : -28,
                            scale: lightboxDir === 0 ? 0.985 : 1,
                          }
                    }
                    animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : {
                            opacity: 0,
                            x: lightboxDir === 0 ? 0 : lightboxDir > 0 ? -28 : 28,
                            scale: 0.995,
                          }
                    }
                    transition={{ duration: reduceMotion ? 0.01 : 0.26, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <NextImage
                      src={activeSrc}
                      alt={lightboxImageAlt || (locale === "en" ? "Hero image" : "Ana sayfa görseli")}
                      fill
                      sizes="(max-width: 768px) 92vw, 1200px"
                      className="object-contain object-center"
                      priority={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

