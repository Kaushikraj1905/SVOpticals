import { useLanguage } from '../../contexts/LanguageContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  light?: boolean;
}

export default function Logo({ size = 'md', showTagline = false, className = '', light = false }: LogoProps) {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Outer frame - Navy */}
          <path
            d="M32 4L4 16V20L32 8L60 20V16L32 4Z"
            fill="#1e3a5f"
          />
          {/* Glasses frame */}
          <ellipse
            cx="22"
            cy="32"
            rx="14"
            ry="12"
            stroke="#1e3a5f"
            strokeWidth="3"
            fill="none"
          />
          <ellipse
            cx="42"
            cy="32"
            rx="14"
            ry="12"
            stroke="#1e3a5f"
            strokeWidth="3"
            fill="none"
          />
          {/* Bridge */}
          <path
            d="M36 32H28"
            stroke="#1e3a5f"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Temple tips */}
          <path
            d="M8 32V28"
            stroke="#1e3a5f"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M56 32V28"
            stroke="#1e3a5f"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Lens shine - Gold accent */}
          <ellipse
            cx="18"
            cy="30"
            rx="8"
            ry="6"
            fill="url(#goldGradient)"
            opacity="0.3"
          />
          <ellipse
            cx="38"
            cy="30"
            rx="8"
            ry="6"
            fill="url(#goldGradient)"
            opacity="0.3"
          />
          {/* Decorative element */}
          <circle
            cx="32"
            cy="56"
            r="4"
            fill="#d4a853"
          />
          <defs>
            <linearGradient id="goldGradient" x1="10" y1="24" x2="26" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d4a853" />
              <stop offset="1" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-display font-bold ${light ? 'text-white' : 'text-navy-900'} ${sizeClasses[size]}`}>
          S V Opticals
        </span>
        {showTagline && (
          <span className={`text-xs md:text-sm ${light ? 'text-gold-400' : 'text-gold-600'} font-medium mt-0.5`}>
            {t('tagline')}
          </span>
        )}
      </div>
    </div>
  );
}
