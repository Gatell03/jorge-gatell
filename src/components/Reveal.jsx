import { useEffect, useRef, useState } from 'react';

// Aparece (sube y se funde) la primera vez que entra en pantalla; dentro, los .mark-draw se subrayan solos
const Reveal = ({ as: Tag = 'div', delay = 0, className = '', children, ...props }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setShown(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-in' : ''} ${className}`} style={{ '--reveal-delay': `${delay}s` }} {...props}>
      {children}
    </Tag>
  );
};

export default Reveal;
