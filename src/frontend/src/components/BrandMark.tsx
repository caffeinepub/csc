interface BrandMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandMark({ className = '', size = 'md' }: BrandMarkProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <img
      src="/assets/generated/vaishnavi-logo.dim_512x512.png"
      alt="वैष्णवी ई-मित्र & CSC केन्द्र"
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
}
