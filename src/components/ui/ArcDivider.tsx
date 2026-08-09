interface ArcDividerProps {
  color?: string;
  flip?: boolean;
  className?: string;
}

/**
 * Motif signature du site : une arche, écho direct de l'arc-en-ciel du logo
 * Best Berry sous lequel les deux enfants sautent. Utilisée comme séparateur
 * de section pour tisser l'identité de marque dans toute la mise en page,
 * plutôt que de ne l'utiliser qu'une fois dans le logo.
 */
export function ArcDivider({ color = 'var(--color-paper)', flip = false, className = '' }: ArcDividerProps) {
  return (
    <div className={`arc-divider ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,100 C240,0 1200,0 1440,100 L1440,100 L0,100 Z" fill={color} />
      </svg>
    </div>
  );
}
