import React, { useRef, useState } from 'react';
import './HeroCarousel.css';

const images = [
    "public/Assets/Hero/Carousel/6.png",
    "public/Assets/Hero/Carousel/7.png",
    "public/Assets/Hero/Carousel/8.png",
    "public/Assets/Hero/Carousel/1.png",
    "public/Assets/Hero/Carousel/2.png",
    "public/Assets/Hero/Carousel/3.png",
    "public/Assets/Hero/Carousel/4.png",
    "public/Assets/Hero/Carousel/5.png",
];

export default function HeroCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDown(true);
    trackRef.current.classList.add('active');
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    if (trackRef.current) trackRef.current.classList.remove('active');
  };

  const handleMouseUp = () => {
    setIsDown(false);
    if (trackRef.current) trackRef.current.classList.remove('active');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="hero-carousel-container">
      <div 
        className="hero-carousel-track" 
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {images.map((src, index) => (
          <div key={index} className="hero-carousel-item">
            <img src={src} alt={`Artwork ${index}`} draggable="false" />
          </div>
        ))}
      </div>
    </div>
  );
}
