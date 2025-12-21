export default function FarmingIllustration() {
  return (
    <div className="text-center max-w-md mx-auto">
      {/* SVG Illustration */}
      <svg viewBox="0 0 400 400" className="w-full h-auto mb-8" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sky */}
        <rect width="400" height="200" fill="#87CEEB" opacity="0.3" />

        {/* Sun */}
        <circle cx="350" cy="60" r="40" fill="#FFD700" opacity="0.8" />

        {/* Mountains */}
        <path d="M 0 150 L 100 80 L 200 150 L 300 90 L 400 150" stroke="#E8C156" strokeWidth="3" fill="none" />

        {/* Field rows */}
        <line x1="50" y1="200" x2="350" y2="200" stroke="#90EE90" strokeWidth="2" opacity="0.6" />
        <line x1="40" y1="220" x2="360" y2="220" stroke="#90EE90" strokeWidth="2" opacity="0.6" />
        <line x1="35" y1="240" x2="365" y2="240" stroke="#90EE90" strokeWidth="2" opacity="0.6" />
        <line x1="30" y1="260" x2="370" y2="260" stroke="#90EE90" strokeWidth="2" opacity="0.6" />

        {/* Crop plants */}
        {[80, 150, 220, 290].map((x) => (
          <g key={x}>
            {/* Stem */}
            <line x1={x} y1="220" x2={x} y2="180" stroke="#228B22" strokeWidth="2" />
            {/* Leaves */}
            <ellipse cx={x - 8} cy="195" rx="6" ry="12" fill="#32CD32" transform={`rotate(-30 ${x - 8} 195)`} />
            <ellipse cx={x + 8} cy="195" rx="6" ry="12" fill="#32CD32" transform={`rotate(30 ${x + 8} 195)`} />
            <ellipse cx={x} cy="185" rx="5" ry="10" fill="#3CB371" />
          </g>
        ))}

        {/* Tractor simplified */}
        <g>
          {/* Body */}
          <rect x="260" y="150" width="80" height="35" rx="5" fill="#DC143C" />
          {/* Cabin */}
          <rect x="320" y="140" width="20" height="25" fill="#DC143C" />
          {/* Window */}
          <rect x="322" y="142" width="16" height="15" fill="#87CEEB" />
          {/* Back wheel */}
          <circle cx="275" cy="190" r="12" fill="#333" />
          {/* Front wheel */}
          <circle cx="330" cy="190" r="10" fill="#333" />
        </g>

        {/* Farmer figure */}
        <g>
          {/* Head */}
          <circle cx="120" cy="120" r="8" fill="#DEB887" />
          {/* Body */}
          <line x1="120" y1="130" x2="120" y2="155" stroke="#4169E1" strokeWidth="3" />
          {/* Arms */}
          <line x1="120" y1="135" x2="100" y2="145" stroke="#DEB887" strokeWidth="2" />
          <line x1="120" y1="135" x2="140" y2="145" stroke="#DEB887" strokeWidth="2" />
          {/* Legs */}
          <line x1="120" y1="155" x2="110" y2="175" stroke="#8B4513" strokeWidth="2" />
          <line x1="120" y1="155" x2="130" y2="175" stroke="#8B4513" strokeWidth="2" />
        </g>
      </svg>

      {/* Text content */}
      <div>
        <h2 className="text-3xl font-bold text-secondary-foreground mb-3">Welcome to AgroLink</h2>
        <p className="text-secondary-foreground/80 text-lg leading-relaxed">
          Connect directly with farmers and buyers. Grow your agricultural business with our trusted marketplace.
        </p>
      </div>
    </div>
  )
}
