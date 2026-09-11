import React, { useRef, useState, useEffect, useCallback } from 'react';
import './HeroCarousel.css';

// Easily add, remove, or reorder images here:
const images = [
  "/assets/Hero/Carousel/6.webp",
  "/assets/Hero/Carousel/7.webp",
  "/assets/Hero/Carousel/8.webp",
  "/assets/Hero/Carousel/1.webp",
  "/assets/Hero/Carousel/2.webp",
  "/assets/Hero/Carousel/3.webp",
  "/assets/Hero/Carousel/4.webp",
  "/assets/Hero/Carousel/5.webp",
];

// 3 copies (prefix, main, suffix) ensure infinite circular scrolling in both directions
const TRIPLE_IMAGES = [...images, ...images, ...images];

export default function HeroCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isAdjustingRef = useRef(false);

  // Position viewport to the middle set so scrolling can occur in both directions
  const initScrollPosition = useCallback(() => {
    const track = trackRef.current;
    if (!track || images.length === 0) return;
    const items = track.querySelectorAll<HTMLElement>('.hero-carousel-item');
    if (items.length >= images.length * 2) {
      const singleSetWidth = items[images.length].offsetLeft - items[0].offsetLeft;
      if (singleSetWidth > 0) {
        track.scrollLeft = singleSetWidth;
        setIsReady(true);
      }
    }
  }, []);

  useEffect(() => {
    initScrollPosition();
    const animId = requestAnimationFrame(initScrollPosition);
    window.addEventListener('resize', initScrollPosition);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', initScrollPosition);
    };
  }, [initScrollPosition]);

  // Seamless circular wrapping when scrolling near boundary thresholds
  const handleScroll = () => {
    if (isAdjustingRef.current) return;
    const track = trackRef.current;
    if (!track || images.length === 0) return;

    const items = track.querySelectorAll<HTMLElement>('.hero-carousel-item');
    if (items.length < images.length * 2) return;

    const singleSetWidth = items[images.length].offsetLeft - items[0].offsetLeft;
    if (singleSetWidth <= 0) return;

    // Scrolled past the middle set to the right -> wrap seamlessly back to middle
    if (track.scrollLeft >= singleSetWidth * 2) {
      isAdjustingRef.current = true;
      track.scrollLeft -= singleSetWidth;
      requestAnimationFrame(() => {
        isAdjustingRef.current = false;
      });
    }
    // Scrolled past the middle set to the left -> wrap seamlessly forward to middle
    else if (track.scrollLeft <= singleSetWidth * 0.15) {
      isAdjustingRef.current = true;
      track.scrollLeft += singleSetWidth;
      requestAnimationFrame(() => {
        isAdjustingRef.current = false;
      });
    }
  };

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    setIsDown(true);
    hasDraggedRef.current = false;
    startXRef.current = e.pageX;
    scrollStartRef.current = track.scrollLeft;
    track.style.scrollSnapType = 'none'; // Unconstrain while dragging
    track.classList.add('active');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !trackRef.current) return;
    e.preventDefault();
    const diff = e.pageX - startXRef.current;
    if (Math.abs(diff) > 5) {
      hasDraggedRef.current = true;
    }
    trackRef.current.scrollLeft = scrollStartRef.current - diff * 1.5;
  };

  const handleMouseUp = () => {
    if (!isDown) return;
    setIsDown(false);
    const track = trackRef.current;
    if (track) {
      track.classList.remove('active');
      track.style.scrollSnapType = 'x mandatory'; // Restore snap animation
    }
  };

  // Click an artwork to smoothly glide it to center
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      return;
    }
    const item = e.currentTarget;
    const track = trackRef.current;
    if (!track) return;

    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    const trackCenter = track.clientWidth / 2;
    const target = itemCenter - trackCenter;

    track.scrollTo({
      left: target,
      behavior: 'smooth',
    });
  };

  return (
    <div className="hero-carousel-container">
      <div
        className={`hero-carousel-track ${isReady ? 'is-ready' : ''}`}
        ref={trackRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {TRIPLE_IMAGES.map((src, index) => (
          <div
            key={index}
            className="hero-carousel-item"
            onClick={handleItemClick}
          >
            <img
              src={src}
              alt={`Artwork ${(index % images.length) + 1}`}
              draggable="false"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
