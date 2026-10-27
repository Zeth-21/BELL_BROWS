import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Petal = {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  phase: number;
  release: number;
};

type Chapter = {
  element: HTMLElement;
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  petals: Petal[];
  side: number;
  name: string;
};

function clamp(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function smooth(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function petalGeometry(width: number, height: number, baseColor: string, tipColor: string) {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const base = new THREE.Color(baseColor);
  const tip = new THREE.Color(tipColor);
  const segmentsX = 8;
  const segmentsY = 12;

  for (let y = 0; y <= segmentsY; y++) {
    const t = y / segmentsY;
    const halfWidth = width * Math.pow(Math.sin(Math.PI * t), .68) * (.4 + .6 * t);
    for (let x = 0; x <= segmentsX; x++) {
      const side = x / segmentsX * 2 - 1;
      positions.push(side * halfWidth, t * height, .14 * Math.sin(Math.PI * t) * (1 - side * side) + .26 * t * t);
      const shade = base.clone().lerp(tip, Math.min(1, t * .85 + Math.abs(side) * .15));
      colors.push(shade.r, shade.g, shade.b);
    }
  }
  for (let y = 0; y < segmentsY; y++) {
    for (let x = 0; x < segmentsX; x++) {
      const a = y * (segmentsX + 1) + x;
      const b = a + segmentsX + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createBotanicalScene(catalog: HTMLElement, mount: HTMLDivElement): () => void {
  const names = ['intro', 'services', 'season', 'bridal'];
  const anchors = names.map((name) => catalog.querySelector<HTMLElement>(`[data-rose-anchor="${name}"]`));
  if (anchors.some((anchor) => !anchor)) return () => {};

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 40);
  scene.add(new THREE.HemisphereLight(0xfff0e9, 0x693748, 2.8));
  const light = new THREE.DirectionalLight(0xfff5ed, 3);
  light.position.set(-3, 5, 6);
  scene.add(light);
  const rim = new THREE.DirectionalLight(0xffa4b2, 2);
  rim.position.set(3, 2, -4);
  scene.add(rim);

  const chapters: Chapter[] = names.map((name, index) => {
    const group = new THREE.Group();
    scene.add(group);
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true, side: THREE.DoubleSide, roughness: .75,
      transparent: true, depthWrite: false, opacity: 0,
    });
    const chapter: Chapter = {
      element: anchors[index]!, group, material, petals: [],
      side: name === 'bridal' || name === 'services' ? -1 : 1, name,
    };
    return chapter;
  });

  const flower = new THREE.Group();
  chapters[0].group.add(flower);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: '#52634b', roughness: .82, transparent: true, opacity: 0 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#748361', side: THREE.DoubleSide, roughness: .8, transparent: true, opacity: 0 });
  const centerMaterial = new THREE.MeshStandardMaterial({ color: '#75223c', roughness: .8, transparent: true, opacity: 0 });

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.035, .06, 2, 7), stemMaterial);
  stem.position.y = -1.4;
  flower.add(stem);
  const heart = new THREE.Mesh(new THREE.SphereGeometry(.32, 16, 12), centerMaterial);
  heart.scale.set(1, 1.25, 1);
  heart.position.y = .3;
  flower.add(heart);

  for (const [i, angle] of [-.8, 1.5].entries()) {
    const leaf = new THREE.Mesh(petalGeometry(.38, .8, '#4c624b', '#9ca87b'), leafMaterial);
    leaf.position.y = -1.35 - i * .3;
    leaf.rotation.set(1.05, angle, i ? -.9 : .9, 'YXZ');
    flower.add(leaf);
  }

  const layers = [
    { count: 6, radius: .13, width: .35, height: .85, tilt: .25, base: '#622039', tip: '#ba627c' },
    { count: 8, radius: .28, width: .49, height: 1.1, tilt: .58, base: '#782940', tip: '#d58397' },
    { count: 10, radius: .44, width: .64, height: 1.25, tilt: .92, base: '#86354c', tip: '#ecb5b7' },
  ];
  layers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i++) {
      const phase = (i / layer.count) * Math.PI * 2 + layerIndex * .31;
      const mesh = new THREE.Mesh(petalGeometry(layer.width, layer.height, layer.base, layer.tip), chapters[0].material);
      mesh.position.set(Math.sin(phase) * layer.radius, -.16, Math.cos(phase) * layer.radius);
      mesh.rotation.set(layer.tilt, phase, .05 * Math.sin(i * 4), 'YXZ');
      flower.add(mesh);
      if (layerIndex > 0) chapters[0].petals.push({
        mesh, position: mesh.position.clone(), rotation: mesh.rotation.clone(), phase,
        release: layerIndex === 2 ? .04 + i * .035 : .35 + i * .045,
      });
    }
  });

  const colors = [
    ['#783349', '#dc8da1'], ['#88384e', '#eab8b8'], ['#a45671', '#f1c2c4'], ['#763247', '#d89ca8'],
  ];
  chapters.slice(1).forEach((chapter, chapterIndex) => {
    const geometry = petalGeometry(.26, .52, colors[chapterIndex + 1][0], colors[chapterIndex + 1][1]);
    for (let i = 0; i < 8; i++) {
      const phase = i * 2.4;
      const mesh = new THREE.Mesh(geometry, chapter.material);
      mesh.rotation.set(.35 + .25 * (i % 3), phase, .15 * i, 'YXZ');
      chapter.group.add(mesh);
      chapter.petals.push({
        mesh, position: mesh.position.clone(), rotation: mesh.rotation.clone(),
        phase, release: .04 + i * .065,
      });
    }
  });

  mount.appendChild(renderer.domElement);
  gsap.registerPlugin(ScrollTrigger);
  const progress = { value: 0 };

  function render() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const mobile = width < 800;
    const units = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 8 / height;
    let strongest = 0;
    let focusX = 0;
    let focusY = 0;

    chapters.forEach((chapter) => {
      const rect = chapter.element.getBoundingClientRect();
      const visible = smooth((height - rect.top) / (height * .26)) * smooth(rect.bottom / (height * .28));
      const travel = chapter.name === 'services' ? Math.min(rect.height, height * 1.15) : rect.height;
      const local = clamp((height * .84 - rect.top) / (travel + height * .62));
      const edge = mobile ? 34 : 62;
      const x = chapter.name === 'intro' && mobile
        ? rect.left + 20
        : chapter.name === 'services' && !mobile
          ? rect.left + rect.width * .36
          : chapter.side === 1 ? rect.right - edge : rect.left + edge;
      const y = chapter.name === 'services'
        ? THREE.MathUtils.clamp(rect.top + rect.height * .5, height * .27, height * .73)
        : rect.top + rect.height * (chapter.name === 'intro' ? mobile ? .78 : .65 : .3);
      chapter.group.position.set((x - width / 2) * units, (height / 2 - y) * units, 0);
      chapter.group.visible = visible > .005;
      chapter.material.opacity = visible * (chapter.name === 'services' ? .48 : .72);

      if (chapter.name === 'intro') {
        const alpha = visible * (1 - smooth((local - .75) / .25) * .6);
        chapter.material.opacity = alpha * .78;
        stemMaterial.opacity = alpha * .82;
        leafMaterial.opacity = alpha * .82;
        centerMaterial.opacity = alpha * .85;
        flower.scale.setScalar(mobile ? .24 : .44);
        flower.rotation.y = -.25 + local * .3;
        chapter.petals.forEach(({ mesh, position, rotation, phase, release }) => {
          const t = smooth((local - release) / (1 - release));
          mesh.position.set(position.x + Math.sin(phase) * 1.6 * t - .3 * t, position.y - (2.4 + phase % 1) * t * t, position.z + .8 * t);
          mesh.rotation.set(rotation.x + 2.5 * t, rotation.y + 2 * t, rotation.z + 1.8 * t, 'YXZ');
        });
      } else {
        chapter.group.scale.setScalar(chapter.name === 'services' ? .76 : mobile ? .72 : 1);
        chapter.petals.forEach(({ mesh, rotation, phase, release }, i) => {
          const t = smooth((local - release) / (1 - release));
          const spread = mobile ? .6 : 1;
          mesh.position.set(
            chapter.side * (.14 + (i % 3) * .22 + t * (1.15 + (i % 4) * .28)) * spread,
            (i % 4) * .21 - t * (1.5 + (i % 3) * .35),
            .25 * Math.sin(phase) + t * .6,
          );
          mesh.rotation.set(rotation.x + 2 * t, rotation.y + phase * t, rotation.z + 2.6 * t, 'YXZ');
        });
      }

      if (visible > strongest) {
        strongest = visible;
        focusX = chapter.side * local * .24;
        focusY = -local * .22;
      }
    });

    mount.style.opacity = strongest > .01 ? '1' : '0';
    // The camera gently follows the leading petals while the artwork stays aligned to each photo.
    camera.position.set(focusX, focusY, 8);
    camera.lookAt(focusX, focusY, 0);
    renderer.render(scene, camera);
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  }

  const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
  resizeObserver.observe(catalog);
  window.addEventListener('resize', resize);
  const tween = gsap.to(progress, {
    value: 1,
    ease: 'none',
    onUpdate: render,
    scrollTrigger: {
      trigger: catalog, start: 'top bottom', end: 'bottom top', scrub: .65,
      onRefresh: render,
      onLeave: () => { mount.style.opacity = '0'; },
      onLeaveBack: () => { mount.style.opacity = '0'; },
    },
  });
  resize();
  ScrollTrigger.refresh();

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    resizeObserver.disconnect();
    window.removeEventListener('resize', resize);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => materials.add(material));
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    mount.style.opacity = '0';
  };
}
