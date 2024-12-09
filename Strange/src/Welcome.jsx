import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import { Canvas } from '@react-three/fiber';  // Canvas component for 3D rendering
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';  // Import the GLTFLoader for .glb files
import { OrbitControls } from '@react-three/drei';  // OrbitControls for camera movement
import { AnimationMixer, Clock } from 'three';  // Import AnimationMixer and Clock from three.js
import './welcome.css';

function Welcome() {
  const navigate = useNavigate();  // Hook for navigation

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-container">
      <h1 className="welcome-title">
        <span className="white-text">Hey</span>{' '}
        <span className="accent-text">Stranger</span>
      </h1>

      {/* Canvas to display the 3D model */}
      <Canvas className="canvas-container">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Model url="/models/patronn.glb" />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

const Model = ({ url }) => {
  const [model, setModel] = useState(null);
  const [mixer, setMixer] = useState(null);  // Store the AnimationMixer
  const [animations, setAnimations] = useState(null);  // Store animations data

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      // Set the model scene
      setModel(gltf.scene);

      // Set animations if they exist
      const modelAnimations = gltf.animations;
      setAnimations(modelAnimations);

      // Initialize the mixer to control the animations
      const animationMixer = new AnimationMixer(gltf.scene);
      setMixer(animationMixer);

      // Add animations to the mixer
      modelAnimations.forEach((clip) => {
        animationMixer.clipAction(clip).play();
      });

      // Apply orange color to all mesh objects in the model
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xff5733 }); // Orange color
        }
      });
    });
  }, [url]);

  useEffect(() => {
    if (mixer) {
      const clock = new Clock();  // Create a new clock instance

      // Update the animation mixer on every frame
      const animate = () => {
        mixer.update(clock.getDelta());
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, [mixer]);

  return model ? (
    <primitive
      object={model}
      scale={[0.04, 0.04, 0.04]}  // Scale the model to 10px (small size)
      position={[-1, 1, 0]}
    />
  ) : null;
};

export default Welcome;
