import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'black' | 'white';
  linkTo?: string;
}

export default function BrandLogo({ className, size = 'md', color = 'black', linkTo = '/' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  const colorClass = color === 'white' ? 'text-white' : 'text-line-black';

  const logo = (
    <span
      className={cn(
        'font-display tracking-widest select-none inline-block',
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      LIN
      <span className="relative inline-block">
        <span className="absolute -top-1.5 left-0 text-[0.5em] font-sans leading-none">°</span>
        E
      </span>
    </span>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity inline-block">
        {logo}
      </Link>
    );
  }

  return logo;
}
