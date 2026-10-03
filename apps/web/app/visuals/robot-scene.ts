import * as THREE from "three";

export interface RobotSceneController {
  dispose(): void;
  setPaused(paused: boolean): void;
}

/** Procedural concept robot. No assets, telemetry, model calls or remote dependencies. */
export function mountRobotScene(host: HTMLElement, { compact = false, motionPreference }: { compact?: boolean; motionPreference?: MediaQueryList } = {}): RobotSceneController | null {
  const canvas = document.createElement("canvas");
  let renderer: THREE.WebGLRenderer;
  let context: WebGL2RenderingContext | null = null;
  try {
    context = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power" });
    if (!context) { host.dataset.sceneState = "fallback"; return null; }
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  } catch {
    try { context?.getExtension("WEBGL_lose_context")?.loseContext(); } catch { /* Keep the fallback usable even after driver failure. */ }
    host.dataset.sceneState = "fallback";
    return null;
  }
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "robot-canvas";
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(3.6, 1.8, 6.7);
  camera.lookAt(0, -0.05, 0);

  const cyan = 0x48c9ad;
  const violet = 0x8863d7;
  const pink = 0xff9c81;
  const shell = new THREE.MeshStandardMaterial({ color: 0x9781d4, roughness: 0.65, metalness: 0.12 });
  const armor = new THREE.MeshStandardMaterial({ color: 0xffcb87, roughness: 0.65, metalness: 0.1 });
  const charcoal = new THREE.MeshStandardMaterial({ color: 0x392b4a, roughness: 0.46, metalness: 0.25 });
  const cyanMaterial = new THREE.MeshBasicMaterial({ color: cyan, toneMapped: false });
  const violetMaterial = new THREE.MeshBasicMaterial({ color: violet, toneMapped: false });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.44, toneMapped: false });

  const robot = new THREE.Group();
  scene.add(robot);
  function box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], material: THREE.Material = shell, edges = false) {
    const geometry = new THREE.BoxGeometry(...size);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    parent.add(mesh);
    if (edges) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial));
    return mesh;
  }
  function sphere(parent: THREE.Object3D, radius: number, position: [number, number, number], material: THREE.Material, scale: [number, number, number] = [1, 1, 1]) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 12), material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }
  function joint(parent: THREE.Object3D, position: [number, number, number], radius = 0.13) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.2, 20), armor);
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  }
  const head = new THREE.Group();
  head.position.y = 0.59;
  robot.add(head);
  const shape = new THREE.Shape();
  shape.moveTo(-0.53, -0.31);
  shape.lineTo(0.53, -0.31);
  shape.quadraticCurveTo(0.63, -0.31, 0.63, -0.21);
  shape.lineTo(0.63, 0.25);
  shape.quadraticCurveTo(0.63, 0.35, 0.53, 0.35);
  shape.lineTo(-0.53, 0.35);
  shape.quadraticCurveTo(-0.63, 0.35, -0.63, 0.25);
  shape.lineTo(-0.63, -0.21);
  shape.quadraticCurveTo(-0.63, -0.31, -0.53, -0.31);
  const headMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.61, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 5 }), shell);
  headMesh.position.z = -0.28;
  head.add(headMesh);
  box(head, [1.14, 0.36, 0.075], [0, 0.045, 0.375], charcoal);
  sphere(head, 0.14, [-0.26, 0.055, 0.427], cyanMaterial, [1.3, 0.65, 0.18]);
  sphere(head, 0.14, [0.26, 0.055, 0.427], cyanMaterial, [1.3, 0.65, 0.18]);
  box(head, [0.27, 0.035, 0.035], [0, -0.19, 0.384], violetMaterial);
  joint(head, [-0.72, 0.015, 0.02], 0.19);
  joint(head, [0.72, 0.015, 0.02], 0.19);
  box(head, [0.045, 0.35, 0.045], [0.4, 0.5, -0.03], armor);
  sphere(head, 0.068, [0.4, 0.71, -0.03], violetMaterial);
  box(robot, [0.94, 0.61, 0.56], [0, -0.08, 0], shell, true);
  box(robot, [0.66, 0.36, 0.08], [0, -0.06, 0.325], charcoal);
  sphere(robot, 0.145, [0, -0.04, 0.388], cyanMaterial, [1, 1, 0.38]);
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.018, 6, 48), armor);
  coreRing.position.set(0, -0.04, 0.38);
  robot.add(coreRing);
  box(robot, [0.67, 0.15, 0.5], [0, -0.49, 0], armor);
  for (const side of [-1, 1]) {
    box(robot, [0.15, 0.38, 0.18], [side * 0.25, -0.77, 0], charcoal);
    joint(robot, [side * 0.25, -0.96, 0.05], 0.12);
    box(robot, [0.36, 0.18, 0.53], [side * 0.25, -1.11, 0.11], shell, true);
    box(robot, [0.25, 0.025, 0.04], [side * 0.25, -1.12, 0.39], cyanMaterial);
  }
  const arms: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.65, 0.025, 0);
    arm.rotation.z = side * 0.18;
    robot.add(arm);
    joint(arm, [0, 0, 0], 0.15);
    box(arm, [0.22, 0.39, 0.24], [0, -0.23, 0], armor);
    const elbow = new THREE.Group();
    elbow.position.y = -0.47;
    elbow.rotation.z = side * 0.3;
    elbow.rotation.x = -0.4;
    arm.add(elbow);
    joint(elbow, [0, 0, 0], 0.12);
    box(elbow, [0.18, 0.3, 0.21], [0, -0.2, 0], shell, true);
    for (const finger of [-1, 1]) {
      const claw = box(elbow, [0.055, 0.2, 0.1], [finger * 0.11, -0.44, 0], armor);
      claw.rotation.z = finger * -0.22;
    }
    arms.push(arm);
  }
  const grid = new THREE.GridHelper(5.4, 24, 0x9f9baf, 0xcac4d8);
  grid.position.y = -1.28;
  const gridMat = grid.material as THREE.Material;
  gridMat.transparent = true;
  gridMat.opacity = 0.28;
  scene.add(grid);
  const platform = new THREE.Mesh(new THREE.RingGeometry(0.97, 1.01, 80), new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = -1.265;
  scene.add(platform);
  const orbits = new THREE.Group();
  scene.add(orbits);
  for (const [radius, color, rotation] of [[1.75, cyan, 0.5], [2.08, violet, -0.75]] as const) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.009, 5, 120), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 }));
    ring.rotation.x = Math.PI / 2 + rotation;
    ring.rotation.y = rotation;
    orbits.add(ring);
  }
  const points: number[] = [];
  for (let i = 0; i < 72; i++) {
    const a = i * 2.399963;
    const r = 1.75 + Math.sin(i * 3.7) * 0.55;
    points.push(Math.cos(a) * r, Math.sin(i * 2.1) * 1.45, Math.sin(a) * r);
  }
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const particles = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color: cyan, size: 0.026, transparent: true, opacity: 0.65, sizeAttenuation: true }));
  orbits.add(particles);
  scene.add(new THREE.AmbientLight(0xfff6ed, 1.8));
  const keyLight = new THREE.DirectionalLight(0xfff9f2, 3.2);
  keyLight.position.set(4, 5, 5);
  scene.add(keyLight);
  const rim = new THREE.PointLight(pink, 4, 10, 2);
  rim.position.set(-2.7, 2, -1.3);
  scene.add(rim);
  const fill = new THREE.PointLight(cyan, 3, 10, 2);
  fill.position.set(3, 0.5, 3.5);
  scene.add(fill);

  let frame = 0;
  let disposed = false;
  let userPaused = false;
  let inView = true;
  let lastRender = 0;
  let phase = 0;
  let pointerX = 0;
  let pointerY = 0;
  const media = motionPreference ?? window.matchMedia("(prefers-reduced-motion: reduce)");
  function render() {
    robot.rotation.y = -0.18 + pointerX * 0.28;
    robot.rotation.x = pointerY * 0.09;
    robot.position.y = Math.sin(phase * 0.7) * 0.045;
    head.rotation.y = Math.sin(phase * 0.35) * 0.08;
    arms[0]!.rotation.z = -0.18 + Math.sin(phase * 0.8) * 0.04;
    orbits.rotation.y = phase * 0.06;
    renderer.render(scene, camera);
  }
  function animate(time: number) {
    frame = 0;
    if (disposed) return;
    if (userPaused || media.matches || !inView || document.hidden) { reconcile(); return; }
    if (time - lastRender >= 1000 / 30) { phase += Math.min((time - lastRender) / 1000, 0.06); lastRender = time; render(); }
    frame = requestAnimationFrame(animate);
  }
  function reconcile() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const running = !disposed && !userPaused && !media.matches && inView && !document.hidden;
    host.dataset.sceneMotion = running ? "running" : "paused";
    if (running) { lastRender = performance.now(); frame = requestAnimationFrame(animate); }
  }
  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }
  const onPointer = (event: PointerEvent) => {
    if (media.matches) return;
    const rect = host.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    if (userPaused) render();
  };
  const onLeave = () => { pointerX = 0; pointerY = 0; if (userPaused) render(); };
  const onLost = (event: Event) => {
    event.preventDefault();
    dispose();
    host.dataset.sceneState = "fallback";
  };
  let resizeObserver: ResizeObserver | undefined;
  let intersection: IntersectionObserver | undefined;
  function dispose() {
    if (disposed) return;
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersection?.disconnect();
    document.removeEventListener("visibilitychange", reconcile);
    media.removeEventListener("change", reconcile);
    host.removeEventListener("pointermove", onPointer);
    host.removeEventListener("pointerleave", onLeave);
    canvas.removeEventListener("webglcontextlost", onLost);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      const drawable = object as THREE.Mesh;
      if (drawable.geometry) geometries.add(drawable.geometry);
      if (drawable.material) for (const material of Array.isArray(drawable.material) ? drawable.material : [drawable.material]) materials.add(material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    host.classList.remove("scene-ready");
    host.dataset.sceneMotion = "paused";
  }
  try {
    resizeObserver = new ResizeObserver(resize);
    intersection = new IntersectionObserver(([entry]) => { inView = !!entry?.isIntersecting; reconcile(); }, { threshold: 0.05 });
    resize();
    host.appendChild(canvas);
    host.classList.add("scene-ready");
    host.dataset.sceneState = "ready";
    resizeObserver.observe(host);
    intersection.observe(host);
    host.addEventListener("pointermove", onPointer, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", reconcile);
    media.addEventListener("change", reconcile);
    canvas.addEventListener("webglcontextlost", onLost);
    reconcile();
    return { dispose, setPaused(paused) { userPaused = paused; reconcile(); render(); } };
  } catch {
    dispose();
    host.dataset.sceneState = "fallback";
    return null;
  }
}
