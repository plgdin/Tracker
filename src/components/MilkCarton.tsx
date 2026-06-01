
interface MilkCartonProps {
  daysRemaining?: number;
  winking?: boolean;
  thumbsUp?: boolean;
  size?: number;
}

export default function MilkCarton({ daysRemaining, winking = false, thumbsUp = false, size = 60 }: MilkCartonProps) {
  // Determine state based on days remaining if not manually overridden
  let isExpired = false;
  let isSick = false;
  let isNeutral = false;

  if (daysRemaining !== undefined) {
    if (daysRemaining < 0) {
      isExpired = true;
    } else if (daysRemaining <= 7) {
      isSick = true;
    } else if (daysRemaining <= 15) {
      isNeutral = true;
    }
  }

  // Choose colors
  let bodyFill = '#FFFDF9'; // Pure crisp milk white
  let cheekColor = '#E63946'; // Cute red blush
  let cheekOpacity = 0.5;

  if (isExpired) {
    bodyFill = '#D8F3DC'; // Dead pale green tint!
    cheekColor = '#52B788'; // Sick green blush
    cheekOpacity = 0.8;
  } else if (isSick) {
    bodyFill = '#F4F1DE'; // Wobbly worried yellow-green face
    cheekColor = '#E07A5F'; // Slightly sick orange-red cheeks
    cheekOpacity = 0.7;
  }

  return (
    <svg 
      viewBox="0 0 80 80" 
      width={size} 
      height={size} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: 'all 0.3s ease' }}
    >
      {/* Cartoon carton body */}
      <path 
        d="M20 58V32L38 20L56 32V58C56 60.5 54 62.5 51.5 62.5H24.5C22 62.5 20 60.5 20 58Z" 
        fill={bodyFill} 
        stroke="#2E1E1E" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Creasing fold details */}
      <path d="M20 32H56" stroke="#2E1E1E" strokeWidth="2.5" />
      <path d="M38 20V32" stroke="#2E1E1E" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M38 20L20 32" stroke="#2E1E1E" strokeWidth="2.5" />
      <path d="M38 20L56 32" stroke="#2E1E1E" strokeWidth="2.5" />

      {/* Face rendering */}
      {thumbsUp ? (
        // --- Thumbs Up Pose Face ---
        <>
          {/* Left Eye (Wink) */}
          <path d="M28 42L34 42" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 42L31 39" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right Eye (Happy arch) */}
          <path d="M44 43C44 41 48 41 48 43" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Happy smiling mouth */}
          <path d="M34 48C34 51 40 51 40 48" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : isExpired ? (
        // --- EXPIRED FACE (Sick dead look x_x) ---
        <>
          {/* Dead Eye Left (X) */}
          <path d="M27 40L33 46" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M33 40L27 46" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Dead Eye Right (X) */}
          <path d="M43 40L49 46" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M49 40L43 46" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sad Tongue Out Mouth */}
          <path d="M33 50H43" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M35 50C35 53 41 53 41 50" fill="#E63946" stroke="#2E1E1E" strokeWidth="2" />
        </>
      ) : isSick ? (
        // --- SICK FACE (Sweating, worried eyes, dizzy mouth) ---
        <>
          {/* Worried Left Eye */}
          <path d="M28 44C26 40 32 40 30 44" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Worried Right Eye */}
          <path d="M44 44C42 40 48 40 46 44" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Squiggly mouth */}
          <path d="M33 49Q35 47 38 49T43 48" stroke="#2E1E1E" strokeWidth="2.2" strokeLinecap="round" />
          {/* Sweat drop falling */}
          <path d="M51 38C51 38 52 35 50 35C48 35 48 37 48 37" stroke="#2A9D8F" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : isNeutral ? (
        // --- NEUTRAL FACE (o_o worried look) ---
        <>
          {/* Wide eyes */}
          <circle cx="30" cy="42" r="2.5" fill="#2E1E1E" />
          <circle cx="46" cy="42" r="2.5" fill="#2E1E1E" />
          {/* Small straight line mouth */}
          <line x1="35" y1="48" x2="41" y2="48" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : winking ? (
        // --- WINKING HAPPY FACE ---
        <>
          {/* Left Eye (Winking) */}
          <path d="M27 43L33 43" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M27 43L30 40" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right Eye (Happy circle) */}
          <circle cx="45" cy="42" r="3" fill="#2E1E1E" />
          {/* Smiling Mouth */}
          <path d="M33 49C33 52 39 52 39 49" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        // --- HAPPY HEALTHY FACE ---
        <>
          {/* Both eyes happy arches */}
          <path d="M27 43C27 41 33 41 33 43" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M43 43C43 41 49 41 49 43" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Large smiling mouth */}
          <path d="M32 48C32 52 40 52 40 48" stroke="#2E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {/* Rosy blush cheeks */}
      <circle cx="25" cy="47" r="3" fill={cheekColor} opacity={cheekOpacity} />
      <circle cx="51" cy="47" r="3" fill={cheekColor} opacity={cheekOpacity} />

      {/* Thumbs Up Hand SVG (Only when thumbsUp is true) */}
      {thumbsUp && (
        <g className="thumbs-up-arm" style={{ animation: 'bounceUp 0.6s ease infinite alternate' }}>
          {/* Arm sleeve */}
          <path 
            d="M56 46C60 46 64 44 65 42" 
            stroke="#2E1E1E" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Red glove fist with Thumb Up! */}
          <path 
            d="M65 42C67 42 69 40 69 38C69 36 67 35 65 35H62V32C62 30 64 28 64 26C64 24 62 23 60 25C58 27 58 29 58 31V35" 
            fill="#E63946" 
            stroke="#2E1E1E" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </g>
      )}
    </svg>
  );
}
