import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Code, Design, Mobile } from './Icons';

const orbitIcons = [
  { Icon: Code, color: '#00e06a', delay: 0 },
  { Icon: Design, color: '#00e06a', delay: 0.5 },
  { Icon: Mobile, color: '#00e06a', delay: 1 },
  { Icon: Code, color: '#00e06a', delay: 1.5 },
  { Icon: Design, color: '#00e06a', delay: 2 },
  { Icon: Mobile, color: '#00e06a', delay: 2.5 },
];

export default function CircularOrbit() {
  const containerRef = useRef(null);
  const orbitsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      orbitsRef.current.forEach((orbit, index) => {
        if (!orbit) return;

        gsap.fromTo(
          orbit,
          {
            rotation: index * 60,
          },
          {
            rotation: index * 60 + 360,
            duration: 15,
            repeat: -1,
            ease: 'none',
          }
        );

        const icon = orbit.querySelector('.orbit-icon');
        if (icon) {
          gsap.to(icon, {
            rotation: -(index * 60 + 360),
            duration: 15,
            repeat: -1,
            ease: 'none',
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="circular-orbit-container">
      <div className="orbit-wrapper">
        {orbitIcons.map((item, index) => (
          <div
            key={index}
            ref={(el) => (orbitsRef.current[index] = el)}
            className="orbit-path"
            style={{ animationDelay: `${item.delay}s` }}
          >
            <div className="orbit-icon" style={{ color: item.color }}>
              <item.Icon size={40} />
            </div>
          </div>
        ))}
        <div className="orbit-center"></div>
      </div>
    </div>
  );
}
