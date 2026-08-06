"use client";

import { useEffect, useState, useRef, JSX } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the WebRTC logo (public/webrtc.svg).
 */

const WEBRTC_EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 6.4,
  bevelEnabled: true,
  bevelThickness: 0.7,
  bevelSize: 0.7,
  bevelSegments: 5,
  curveSegments: 32,
};

const WEBRTC_SVG_STRING = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 -3.5 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
	<g>
		<path d="M142.076578,191.086817 C142.076578,159.280656 116.294759,133.494615 84.4885969,133.494615 C52.6782136,133.494615 26.896394,159.280656 26.896394,191.086817 C26.896394,222.892979 52.6782136,248.67902 84.4885969,248.67902 C116.294759,248.67902 142.076578,222.892979 142.076578,191.086817" fill="#FF6600" transform="translate(84.486486, 191.086817) scale(1, -1) translate(-84.486486, -191.086817) ">
</path>
		<path d="M255.979703,110.454356 C255.979703,78.652416 230.197884,52.862153 198.391722,52.862153 C166.581339,52.862153 140.799519,78.652416 140.799519,110.454356 C140.799519,142.260518 166.581339,168.050781 198.391722,168.050781 C230.197884,168.050781 255.979703,142.260518 255.979703,110.454356" fill="#FFCC00" transform="translate(198.389611, 110.456467) scale(1, -1) translate(-198.389611, -110.456467) ">
</path>
		<path d="M115.200498,109.176452 C115.200498,77.3745125 89.4186786,51.5842495 57.6082953,51.5842495 C25.8063553,51.5842495 0.0203140271,77.3745125 0.0203140271,109.176452 C0.0203140271,140.982614 25.8063553,166.772877 57.6082953,166.772877 C89.4186786,166.772877 115.200498,140.982614 115.200498,109.176452" fill="#0089CC" transform="translate(57.610406, 109.178563) scale(1, -1) translate(-57.610406, -109.178563) ">
</path>
		<path d="M230.385749,191.086817 C230.385749,159.280656 204.603929,133.494615 172.789324,133.494615 C140.987384,133.494615 115.201343,159.280656 115.201343,191.086817 C115.201343,222.892979 140.987384,248.67902 172.789324,248.67902 C204.603929,248.67902 230.385749,222.892979 230.385749,191.086817" fill="#009939" transform="translate(172.793546, 191.086817) scale(1, -1) translate(-172.793546, -191.086817) ">
</path>
		<path d="M185.592001,57.9843213 C185.592001,26.1781597 159.805959,0.392118349 127.999798,0.392118349 C96.1936359,0.392118349 70.4075946,26.1781597 70.4075946,57.9843213 C70.4075946,89.790483 96.1936359,115.576524 127.999798,115.576524 C159.805959,115.576524 185.592001,89.790483 185.592001,57.9843213" fill="#BF0000" transform="translate(127.999798, 57.984321) scale(1, -1) translate(-127.999798, -57.984321) ">
</path>
		<path d="M140.798675,57.9788331 C140.798675,56.76721 140.904217,55.580917 140.980207,54.3861807 C166.525612,60.2796505 185.590734,83.1189569 185.590734,110.454356 C185.590734,111.665979 185.485192,112.856494 185.409202,114.05123 C159.863796,108.153539 140.798675,85.3142322 140.798675,57.9788331" fill="#FC0007" transform="translate(163.194704, 84.218705) scale(1, -1) translate(-163.194704, -84.218705) ">
</path>
		<path d="M148.39686,162.570614 C158.322038,145.219495 176.973434,133.495881 198.394255,133.495881 C207.124696,133.495881 215.369643,135.496959 222.787141,138.975626 C212.866185,156.326744 194.214789,168.050358 172.789746,168.050358 C164.059305,168.050358 155.814358,166.049281 148.39686,162.570614" fill="#1CD306" transform="translate(185.592001, 150.773120) scale(1, -1) translate(-185.592001, -150.773120) ">
</path>
		<path d="M115.200498,191.086817 C115.200498,177.015947 120.258075,164.139813 128.642338,154.138646 C137.018157,164.139813 142.075734,177.015947 142.075734,191.086817 C142.075734,205.157688 137.018157,218.033822 128.642338,228.034989 C120.258075,218.033822 115.200498,205.157688 115.200498,191.086817" fill="#0F7504" transform="translate(128.638116, 191.086817) scale(1, -1) translate(-128.638116, -191.086817) ">
</path>
		<path d="M34.806984,138.212768 C41.8023132,135.190043 49.5026635,133.497148 57.6082953,133.497148 C78.818032,133.497148 97.2963396,144.992791 107.293286,162.061056 C100.297956,165.083782 92.5933844,166.772455 84.4919743,166.772455 C63.2822376,166.772455 44.7997083,155.276811 34.806984,138.212768" fill="#0C5E87" transform="translate(71.050135, 150.134801) scale(1, -1) translate(-71.050135, -150.134801) ">
</path>
		<path d="M70.6545631,114.036032 C70.5194692,112.431792 70.4054838,110.819109 70.4054838,109.176875 C70.4054838,81.862584 89.4410536,59.044386 114.956907,53.1255861 C115.087779,54.7298257 115.201765,56.3425087 115.201765,57.9805218 C115.201765,85.2948125 96.1704167,108.121454 70.6545631,114.036032" fill="#6B0001" transform="translate(92.803624, 83.580809) scale(1, -1) translate(-92.803624, -83.580809) ">
</path>
		<path d="M76.0304545,111.503866 L67.0213825,111.503866 C59.0677312,111.503866 52.6001125,117.950377 52.6001125,125.88292 L52.6001125,207.428953 C52.6001125,215.361496 59.0677312,221.812228 67.0213825,221.812228 L179.989405,221.812228 C187.943056,221.812228 194.406453,215.361496 194.406453,207.428953 L194.406453,125.88292 C194.406453,117.950377 187.943056,111.503866 179.989405,111.503866 L141.50454,111.503866 L64.2899534,73.6522544 L76.0304545,111.503866 L76.0304545,111.503866 Z" fill="#FFFFFF" transform="translate(123.503283, 147.732241) scale(1, -1) translate(-123.503283, -147.732241) ">
</path>
	</g>
</svg>`;

export function WebRTCLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [meshes, setMeshes] = useState<JSX.Element[]>([]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined") return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(WEBRTC_SVG_STRING);
      const generatedMeshes: JSX.Element[] = [];

      svgData.paths.forEach((path, index) => {
        const fill = (path.userData as { style: { fill: string } }).style.fill;

        if (fill !== undefined && fill !== 'none') {
          const hexColor = "#" + path.color.getHexString();
          
          let emissiveColor = "#000000";
          let emissiveIntensity = 0;
          let metalness = 0.1;

          if (hexColor === "#ffffff") {
            emissiveColor = "#e0e0e0";
            emissiveIntensity = 0.1;
            metalness = 0.2;
          }

          const shapes = path.toShapes();
          
          if (shapes.length > 0) {
            const geo = new THREE.ExtrudeGeometry(shapes, WEBRTC_EXTRUDE_SETTINGS);
            geo.computeVertexNormals();

            // Translate center relative to 256x256 SVG viewbox (Viewbox is actually 0 -3.5 256 256)
            geo.translate(-128, -124.5, 0);

            // Scale uniformly
            geo.scale(0.014, 0.014, 0.014);

            // Z-offset to prevent z-fighting across layers
            const zOffset = (index * 0.03);
            geo.translate(0, 0, zOffset);

            generatedMeshes.push(
              <mesh key={index} geometry={geo} scale={[1, -1, 1]} castShadow receiveShadow>
                <meshPhysicalMaterial
                  color={hexColor}
                  roughness={0.15}
                  metalness={metalness}
                  emissive={emissiveColor}
                  emissiveIntensity={emissiveIntensity}
                  clearcoat={1.0}
                  clearcoatRoughness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          }
        }
      });

      setMeshes(generatedMeshes);
    } catch (err) {
      console.warn("SVGLoader parsing error for WebRTC logo:", err);
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {meshes}
    </group>
  );
}
