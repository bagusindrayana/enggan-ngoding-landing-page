
import React, { useRef, useEffect, useCallback } from 'react';

// --- Neumorphic Wave Banner Component ---
function NeumorphicWaveBanner() {
    // Ref to access the canvas DOM element
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    // Ref to store the animation frame request ID for cleanup
    const animationFrameId = useRef<number | null>(null);
    // Ref to store canvas dimensions and context
    const canvasContext = useRef<{ ctx: CanvasRenderingContext2D | null; width: number; height: number }>({ ctx: null, width: 0, height: 0 });
     // Ref to store time for animation state
    const time = useRef(0);
  
    // --- Wave Parameters --- (Consider making these props or state if they need to be dynamic)
    const waveColor = 'rgba(163, 177, 198, 0.5)'; // Color of the wave
    const amplitude = 30; // Height of the wave
    const frequency = 0.01; // How many waves appear across the width
    const speed = 0.03; // How fast the wave moves horizontally
    const verticalOffset = 0.7; // Vertical position (0.5 = middle, >0.5 = lower)
    // --- End Wave Parameters ---
  
    // Function to draw the wave - wrapped in useCallback to stabilize its identity
    const drawWave = useCallback(() => {
      const { ctx, width, height } = canvasContext.current;
      if (!ctx) return; // Don't draw if context isn't ready
  
      // Clear the canvas
      ctx.clearRect(0, 0, width, height);
  
      // Begin drawing the path
      ctx.beginPath();
      ctx.moveTo(0, height * verticalOffset); // Start drawing from the left edge
  
      for (let x = 0; x < width; x++) {
        // Calculate y position using a sine wave
        const y = Math.sin(x * frequency + time.current) * amplitude + height * verticalOffset;
        ctx.lineTo(x, y);
      }
  
      // Style the wave
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 5; // Thickness of the wave line
      // ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'; // Optional subtle glow
      // ctx.shadowBlur = 5;
  
      // Draw the line
      ctx.stroke();
    }, [amplitude, frequency, verticalOffset, waveColor]); // Dependencies for drawWave
  
    // Animation loop function - wrapped in useCallback
    const animate = useCallback(() => {
      // Update time to make the wave move
      time.current += speed;
  
      // Draw the wave with the updated time
      drawWave();
  
      // Request the next frame for smooth animation
      animationFrameId.current = requestAnimationFrame(animate);
    }, [drawWave, speed]); // Dependency for animate
  
    // Function to handle canvas resizing - wrapped in useCallback
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        // Get the parent banner element to determine size
        const banner = canvas?.parentElement;
        if (canvas && banner) {
            const newWidth = banner.offsetWidth;
            const newHeight = banner.offsetHeight;
            canvas.width = newWidth;
            canvas.height = newHeight;
            // Update context ref dimensions
            canvasContext.current.width = newWidth;
            canvasContext.current.height = newHeight;
            // Redraw the wave immediately after resize
            drawWave();
        }
    }, [drawWave]); // Dependency for resizeCanvas
  
  
    // Effect for initialization, animation start, and cleanup
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Get canvas context and store it
        canvasContext.current.ctx = canvas.getContext('2d');
  
        // Initial resize to set dimensions
        resizeCanvas();
  
        // Start the animation loop
        animationFrameId.current = requestAnimationFrame(animate);
  
        // Add resize listener
        window.addEventListener('resize', resizeCanvas);
      }
  
      // --- Cleanup function ---
      // This runs when the component unmounts
      return () => {
        // Stop the animation loop
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        // Remove the resize listener to prevent memory leaks
        window.removeEventListener('resize', resizeCanvas);
      };
    }, [animate, resizeCanvas]); // Dependencies for the effect
  
  
    // --- Component Render ---
    return (
      <>
      <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-0 opacity-60"
        />
      </>
    );
  }

  export default NeumorphicWaveBanner;