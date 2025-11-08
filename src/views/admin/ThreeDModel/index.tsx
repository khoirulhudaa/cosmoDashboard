// ThreeDModel.tsx
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

interface ThreeDModelProps {
  url: string;
  onLoaded: () => void;
  cameraPosition?: [number, number, number];
  maxDistance?: number;
  autoRotate?: boolean;
  onCameraChange?: (pos: [number, number, number], maxDist: number) => void;
  onProgress?: (progress: number) => void;
}

export interface ThreeDModelRef {
  resetCamera: () => void;
}

const ModelScene = React.memo(
  ({
    url,
    scale,
    cameraPosition,
    maxDistance,
    autoRotate,
    onCameraChange,
    onProgress,
    onLoaded,
  }: {
    url: string;
    scale: [number, number, number];
    cameraPosition?: [number, number, number];
    maxDistance?: number;
    autoRotate?: boolean;
    onCameraChange?: (pos: [number, number, number], maxDist: number) => void;
    onProgress?: (progress: number) => void;
    onLoaded: () => void;
  }) => {
    const { scene } = useGLTF(url, true, true, (loader) => {
      loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        onProgress?.((itemsLoaded / itemsTotal) * 100);
      };
    });

    console.log('selectedModel.fullUrl', url)

    const groupRef = useRef<THREE.Group>(null);
    const modelRef = useRef<THREE.Group>(null);
    const { camera, gl, raycaster, mouse, scene: threeScene } = useThree();

    // Auto-fit
    useEffect(() => {
      if (!modelRef.current || !scene) return;

      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      groupRef.current.position.set(-center.x, -center.y, -center.z);
      
      const cameras = camera as any;
      const distance = maxDim / Math.tan((cameras.fov * Math.PI) / 180 / 2);
      // if (camera.type === "PerspectiveCamera") {
      //   const fovRad = (cameras.fov * Math.PI) / 180;
      // }

      const defaultPos: [number, number, number] = [0, 0, distance];
      if (!cameraPosition) {
        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);
       
        onCameraChange?.(defaultPos, 350);
      }

      onLoaded();
    }, [scene, camera, cameraPosition, maxDistance, onCameraChange, onLoaded]);

    // Update posisi kamera
    useEffect(() => {
      if (cameraPosition) {
        camera.position.set(...cameraPosition);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      }
    }, [cameraPosition, camera]);

    // Update maxDistance & autoRotate
    useEffect(() => {
      const controls = (gl.domElement as any)._orbitControls;
      if (controls) {
        if (maxDistance !== undefined) controls.maxDistance = maxDistance;
        if (autoRotate !== undefined) {
          controls.target.set(0, 0, 0);
        controls.update();
        }
      }
    }, [maxDistance, autoRotate, gl]);

    // ZOOM TO CURSOR
    useFrame(() => {
      const controls = (gl.domElement as any)._orbitControls;
      if (!controls) return;

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        const delta = event.deltaY > 0 ? 1 : -1;
        const factor = 1.1;
        const newDistance = controls.getDistance() * (delta > 0 ? factor : 1 / factor);
        const clampedDistance = Math.max(1, Math.min(newDistance, controls.maxDistance));

        // Ambil posisi mouse
        const rect = gl.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast ke model
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(modelRef.current!, true);

        let targetPoint = new THREE.Vector3(0, 0, 0);
        if (intersects.length > 0) {
          targetPoint = intersects[0].point;
        } else {
          // Jika tidak kena model, gunakan arah dari kamera
          const direction = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();
          targetPoint = camera.position.clone().add(direction.multiplyScalar(clampedDistance));
        }

        // Hitung posisi kamera baru
        const direction = new THREE.Vector3().subVectors(targetPoint, camera.position).normalize();
        const newPosition = targetPoint.clone().sub(direction.multiplyScalar(clampedDistance));

        // Update posisi
        camera.position.copy(newPosition);
        controls.target.copy(targetPoint);
        controls.update();

        // Update state
        onCameraChange?.(
          [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
          controls.maxDistance
        );
      };

      const domElement = gl.domElement;
      domElement.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        domElement.removeEventListener("wheel", handleWheel);
      };
    });

    return (
      <group ref={groupRef}>
        <primitive ref={modelRef} object={scene} scale={scale} />
      </group>
    );
  }
);

const ThreeDModel = forwardRef<ThreeDModelRef, ThreeDModelProps>(
  (
    {
      url,
      onLoaded,
      cameraPosition,
      maxDistance,
      autoRotate = false,
      onCameraChange,
      onProgress,
    },
    ref
  ) => {
    const controlsRef = useRef<any>(null);

    const handleControlsChange = () => {
      if (!controlsRef.current) return;
      const cam = controlsRef.current.object;
      onCameraChange?.(
        [cam.position.x, cam.position.y, cam.position.z] as [number, number, number],
        controlsRef.current.maxDistance
      );
    };

    const resetCamera = () => {
      controlsRef.current?.reset();
    };

    useImperativeHandle(ref, () => ({ resetCamera }));

    return (
      <Canvas
        camera={{ position: cameraPosition || [0, 0, 5], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={1.2} />

        <OrbitControls
          ref={controlsRef}
          enableZoom={true}         
          enablePan={false}
          enableDamping={false}      
          minDistance={1}
          maxDistance={350}
          autoRotate={autoRotate}
          autoRotateSpeed={1.0}
          onChange={(e) => {
            if (!e) return;
            const cam = e.target.object;
          }}
        />

        <React.Suspense fallback={null}>
          <ModelScene
            url={url}
            scale={[1, 1, 1]}
            cameraPosition={cameraPosition}
            maxDistance={maxDistance}
            autoRotate={autoRotate}
            onCameraChange={onCameraChange}
            onProgress={onProgress}
            onLoaded={onLoaded}
          />
        </React.Suspense>
      </Canvas>
    );
  }
);

ThreeDModel.displayName = "ThreeDModel";

export default ThreeDModel;