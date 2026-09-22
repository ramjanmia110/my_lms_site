'use client'

export function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 520 480"
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ill-archOuter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFE6FC" />
          <stop offset="100%" stopColor="#F4EDFF" />
        </linearGradient>
        <linearGradient id="ill-archInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF7FF" />
          <stop offset="100%" stopColor="#F3ECFD" />
        </linearGradient>
        <linearGradient id="ill-hoodie" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7E57F5" />
          <stop offset="60%" stopColor="#6D3DF5" />
          <stop offset="100%" stopColor="#5B2EE0" />
        </linearGradient>
        <linearGradient id="ill-hoodieShadow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#5B2EE0" />
          <stop offset="100%" stopColor="#4A21C8" />
        </linearGradient>
        <linearGradient id="ill-mug" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0EAFB" />
        </linearGradient>
        <linearGradient id="ill-dash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2A2252" />
          <stop offset="100%" stopColor="#1C1740" />
        </linearGradient>
        <linearGradient id="ill-cta" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6D3DF5" />
          <stop offset="100%" stopColor="#3478F6" />
        </linearGradient>
        <linearGradient id="ill-plantPot" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#F2A33C" />
          <stop offset="100%" stopColor="#D97B35" />
        </linearGradient>
        <linearGradient id="ill-deskTop" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#EAD0B2" />
          <stop offset="50%" stopColor="#D6B28C" />
          <stop offset="100%" stopColor="#C9A37B" />
        </linearGradient>
        <linearGradient id="ill-skin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#F5CEA5" />
          <stop offset="100%" stopColor="#E8B892" />
        </linearGradient>
        <linearGradient id="ill-laptopBase" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#E0D9EE" />
          <stop offset="100%" stopColor="#C9BFD8" />
        </linearGradient>
        <filter id="ill-shadowSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="0" dy="4" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.12" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ill-shadowTight" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.15" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ---- arched wall nook ---- */}
      <path
        d="M42 460 L42 185 Q42 68 260 68 Q478 68 478 185 L478 460 Z"
        fill="url(#ill-archOuter)"
      />
      <path
        d="M65 460 L65 193 Q65 90 260 90 Q455 90 455 193 L455 460 Z"
        fill="url(#ill-archInner)"
      />

      {/* wall texture lines */}
      <line x1="160" y1="100" x2="160" y2="180" stroke="#E0D5F0" strokeWidth="0.5" opacity="0.4" />
      <line x1="360" y1="100" x2="360" y2="180" stroke="#E0D5F0" strokeWidth="0.5" opacity="0.4" />

      {/* wall decal quote */}
      <text
        x="280"
        y="118"
        textAnchor="middle"
        fontSize="18"
        fontStyle="italic"
        fontWeight="600"
        fontFamily="'Playfair Display', Georgia, serif"
        fill="#6D3DF5"
        opacity="0.55"
      >
        Dream · Learn · Earn
      </text>
      <path
        d="M210 127 Q280 135 350 127"
        stroke="#6D3DF5"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />

      {/* ---- shelf ledge with plant ---- */}
      <rect x="58" y="138" width="132" height="10" rx="4" fill="#C9A37B" />
      <rect x="58" y="136" width="132" height="3" rx="1.5" fill="#D6B28C" />
      {/* shelf brackets */}
      <path d="M68 148 L68 158 L60 158 Z" fill="#B28760" opacity="0.6" />
      <path d="M180 148 L180 158 L188 158 Z" fill="#B28760" opacity="0.6" />

      {/* plant pot */}
      <ellipse cx="124" cy="100" rx="22" ry="4" fill="#E8993A" />
      <path d="M106 102 h36 l5 30 h-46 z" fill="url(#ill-plantPot)" />
      <ellipse cx="124" cy="132" rx="23" ry="3" fill="#C56A28" opacity="0.4" />

      {/* plant leaves — more realistic */}
      <path d="M124 100 C 124 76 112 66 108 56 C 126 62 134 72 134 98 Z" fill="#34C77B" />
      <path d="M124 100 C 124 76 112 66 108 56 C 126 62 134 72 134 98 Z" fill="url(#ill-archInner)" opacity="0.15" />
      <path d="M118 100 C 102 90 88 80 80 68 C 98 80 108 86 118 100 Z" fill="#22A06B" />
      <path d="M130 100 C 146 92 158 82 166 72 C 150 86 134 92 128 100 Z" fill="#2DB87F" />
      <path d="M124 100 C 124 82 136 74 144 62 C 130 74 122 84 124 100 Z" fill="#25B574" opacity="0.8" />
      {/* small drooping leaf */}
      <path d="M110 100 C 94 96 82 92 74 84 C 86 94 100 98 110 100 Z" fill="#1E8C5C" opacity="0.7" />

      {/* ---- person sitting at desk from behind ---- */}
      <g filter="url(#ill-shadowSoft)">
        {/* torso (hoodie) — better shaped */}
        <path
          d="M224 260 Q222 228 320 226 Q418 228 416 260 L414 362 Q320 368 226 362 Z"
          fill="url(#ill-hoodie)"
        />
        {/* hoodie center seam */}
        <line x1="320" y1="240" x2="320" y2="355" stroke="#5B2EE0" strokeWidth="1" opacity="0.3" />
        {/* hoodie back pocket */}
        <rect x="290" y="310" width="60" height="28" rx="8" fill="#6030D8" opacity="0.25" />
        {/* shoulders */}
        <path d="M224 260 Q224 248 260 244" stroke="#5B2EE0" strokeWidth="2" opacity="0.2" fill="none" />
        <path d="M416 260 Q416 248 380 244" stroke="#5B2EE0" strokeWidth="2" opacity="0.2" fill="none" />
      </g>

      {/* neck */}
      <rect x="308" y="210" width="24" height="22" rx="10" fill="url(#ill-skin)" />

      {/* back of head (hair) — more detailed */}
      <ellipse cx="320" cy="200" rx="28" ry="30" fill="#3B2A20" />
      <ellipse cx="318" cy="196" rx="24" ry="26" fill="#4A3728" />
      {/* hair texture */}
      <path d="M298 192 Q310 182 334 190" stroke="#2E1E14" strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M300 198 Q314 188 338 196" stroke="#2E1E14" strokeWidth="0.8" fill="none" opacity="0.2" />

      {/* hood rim behind headphones */}
      <path d="M298 212 Q320 204 342 212 Q348 232 320 240 Q292 232 298 212 Z" fill="#5B2EE0" />
      <path d="M298 212 Q320 204 342 212 Q348 232 320 240 Q292 232 298 212 Z" fill="none" stroke="#4A21C8" strokeWidth="1" opacity="0.3" />

      {/* over-ear headphones — more realistic */}
      <path d="M288 180 A 34 34 0 0 1 352 180" stroke="#262039" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M288 180 A 34 34 0 0 1 352 180" stroke="#33294A" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* left ear cup */}
      <ellipse cx="285" cy="198" rx="9" ry="14" fill="#262039" />
      <ellipse cx="285" cy="198" rx="7" ry="11" fill="#33294A" />
      <ellipse cx="285" cy="198" rx="5" ry="8" fill="#7C4DFF" opacity="0.5" />
      <rect x="280" y="184" width="10" height="4" rx="2" fill="#262039" />
      {/* right ear cup */}
      <ellipse cx="355" cy="198" rx="9" ry="14" fill="#262039" />
      <ellipse cx="355" cy="198" rx="7" ry="11" fill="#33294A" />
      <ellipse cx="355" cy="198" rx="5" ry="8" fill="#7C4DFF" opacity="0.5" />
      <rect x="350" y="184" width="10" height="4" rx="2" fill="#262039" />

      {/* ---- desk ---- */}
      <ellipse cx="260" cy="478" rx="240" ry="12" fill="#5B2EE0" opacity="0.05" />
      {/* legs — with shadow */}
      <rect x="66" y="430" width="16" height="46" rx="5" fill="#B98F66" />
      <rect x="66" y="430" width="6" height="46" rx="3" fill="#C9A37B" opacity="0.4" />
      <rect x="438" y="430" width="16" height="46" rx="5" fill="#B98F66" />
      <rect x="438" y="430" width="6" height="46" rx="3" fill="#C9A37B" opacity="0.4" />
      {/* crossbar */}
      <rect x="74" y="452" width="376" height="6" rx="3" fill="#B98F66" opacity="0.5" />

      {/* desk front face */}
      <rect x="42" y="378" width="436" height="56" rx="6" fill="url(#ill-deskTop)" />
      {/* wood grain */}
      <line x1="120" y1="390" x2="120" y2="426" stroke="#C09A6E" strokeWidth="0.6" opacity="0.3" />
      <line x1="220" y1="386" x2="220" y2="430" stroke="#C09A6E" strokeWidth="0.5" opacity="0.25" />
      <line x1="340" y1="390" x2="340" y2="426" stroke="#C09A6E" strokeWidth="0.6" opacity="0.3" />
      <line x1="400" y1="392" x2="400" y2="424" stroke="#C09A6E" strokeWidth="0.5" opacity="0.2" />
      {/* desk edge highlight */}
      <rect x="42" y="376" width="436" height="4" rx="2" fill="#E8D4B6" opacity="0.7" />

      {/* desk top face (perspective) */}
      <rect x="42" y="364" width="436" height="14" rx="7" fill="#EAD0B2" />

      {/* ---- books stack (4 labeled textbooks) with 3D effect ---- */}
      <g filter="url(#ill-shadowTight)">
        {/* Business & Freelancing */}
        <rect x="44" y="252" width="152" height="28" rx="5" fill="#F59E0B" />
        <rect x="44" y="252" width="152" height="3" rx="1.5" fill="#FBBF24" opacity="0.6" />
        <rect x="44" y="252" width="20" height="28" rx="5" fill="#FFFFFF" opacity="0.18" />
        <rect x="44" y="276" width="152" height="4" rx="2" fill="#D97706" opacity="0.3" />
        <text x="122" y="271" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Poppins, sans-serif" fill="#fff">
          Business &amp; Freelancing
        </text>

        {/* Graphic Design */}
        <rect x="40" y="278" width="152" height="28" rx="5" fill="#18A878" />
        <rect x="40" y="278" width="152" height="3" rx="1.5" fill="#2DD4BF" opacity="0.5" />
        <rect x="40" y="278" width="20" height="28" rx="5" fill="#FFFFFF" opacity="0.18" />
        <rect x="40" y="302" width="152" height="4" rx="2" fill="#147A60" opacity="0.3" />
        <text x="120" y="297" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Poppins, sans-serif" fill="#fff">
          Graphic Design
        </text>

        {/* Digital Marketing */}
        <rect x="44" y="304" width="152" height="28" rx="5" fill="#3478F6" />
        <rect x="44" y="304" width="152" height="3" rx="1.5" fill="#60A5FA" opacity="0.5" />
        <rect x="44" y="304" width="20" height="28" rx="5" fill="#FFFFFF" opacity="0.18" />
        <rect x="44" y="328" width="152" height="4" rx="2" fill="#2563EB" opacity="0.3" />
        <text x="122" y="323" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Poppins, sans-serif" fill="#fff">
          Digital Marketing
        </text>

        {/* Web Development */}
        <rect x="40" y="330" width="152" height="28" rx="5" fill="#6D3DF5" />
        <rect x="40" y="330" width="152" height="3" rx="1.5" fill="#A78BFA" opacity="0.5" />
        <rect x="40" y="330" width="20" height="28" rx="5" fill="#FFFFFF" opacity="0.18" />
        <rect x="40" y="354" width="152" height="4" rx="2" fill="#5B21B6" opacity="0.3" />
        <text x="120" y="349" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Poppins, sans-serif" fill="#fff">
          Web Development
        </text>
      </g>

      {/* ---- coffee mug ---- */}
      <g filter="url(#ill-shadowTight)">
        <path d="M198 320 h38 a4 4 0 0 1 4 4 v42 a4 4 0 0 1 -4 4 h-38 a4 4 0 0 1 -4 -4 v-42 a4 4 0 0 1 4 -4 z" fill="url(#ill-mug)" stroke="#E6DEF6" strokeWidth="1.5" />
        {/* mug inner shadow */}
        <ellipse cx="217" cy="322" rx="18" ry="3" fill="#E6DEF6" opacity="0.4" />
        {/* handle */}
        <path d="M240 332 a14 14 0 0 1 0 28" stroke="#E6DEF6" strokeWidth="5" fill="none" />
        <path d="M240 332 a14 14 0 0 1 0 28" stroke="#D4CCE8" strokeWidth="3" fill="none" opacity="0.3" />
        {/* mug band */}
        <rect x="198" y="330" width="38" height="6" rx="3" fill="#6D3DF5" opacity="0.75" />
        {/* steam wisps */}
        <path d="M210 312 c-2 -6 4 -8 2 -14" stroke="#C4B9E8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M220 314 c-2 -5 4 -7 2 -12" stroke="#C4B9E8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M226 316 c-1 -4 3 -6 1 -10" stroke="#C4B9E8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
      </g>

      {/* ---- phone (leaning next to mug) ---- */}
      <g transform="rotate(8 250 340)" filter="url(#ill-shadowTight)">
        <rect x="238" y="318" width="24" height="44" rx="5" fill="#1F1B3D" />
        <rect x="238" y="318" width="24" height="4" rx="2" fill="#2D2650" />
        <rect x="241" y="326" width="18" height="28" rx="3" fill="url(#ill-dash)" />
        {/* phone screen content — notification */}
        <rect x="243" y="330" width="14" height="4" rx="1" fill="#6D3DF5" opacity="0.6" />
        <rect x="243" y="336" width="10" height="2" rx="1" fill="#8A76D8" opacity="0.4" />
        <circle cx="250" cy="322" r="1.5" fill="#7C4DFF" opacity="0.8" />
      </g>

      {/* ---- laptop with course dashboard UI ---- */}
      <g filter="url(#ill-shadowSoft)">
        {/* screen shadow on desk */}
        <ellipse cx="340" cy="364" rx="88" ry="7" fill="#5B2EE0" opacity="0.08" />
        {/* screen back casing */}
        <rect x="258" y="236" width="152" height="112" rx="10" fill="#241A5C" />
        <rect x="258" y="236" width="152" height="4" rx="2" fill="#302568" />
        {/* camera dot */}
        <circle cx="334" cy="244" r="2.5" fill="#3A2F68" />
        <circle cx="334" cy="244" r="1.2" fill="#7C4DFF" opacity="0.6" />

        {/* screen */}
        <rect x="264" y="244" width="140" height="96" rx="6" fill="url(#ill-dash)" />

        {/* sidebar */}
        <rect x="264" y="244" width="22" height="96" rx="6" fill="#161432" />
        <rect x="270" y="254" width="10" height="3" rx="1.5" fill="#453588" />
        <circle cx="275" cy="268" r="3.5" fill="#34D399" />
        <rect x="270" y="274" width="10" height="3" rx="1.5" fill="#453588" opacity="0.6" />
        <circle cx="275" cy="286" r="3.5" fill="#8A76D8" opacity="0.7" />
        <rect x="270" y="292" width="10" height="3" rx="1.5" fill="#453588" opacity="0.6" />
        <circle cx="275" cy="304" r="3.5" fill="#8A76D8" opacity="0.7" />
        <rect x="270" y="310" width="10" height="3" rx="1.5" fill="#453588" opacity="0.6" />
        <circle cx="275" cy="322" r="3.5" fill="#8A76D8" opacity="0.7" />

        {/* header area */}
        <rect x="294" y="250" width="100" height="8" rx="4" fill="#8B7BD8" opacity="0.8" />
        <rect x="294" y="263" width="60" height="6" rx="3" fill="#6D3DF5" />
        <rect x="358" y="263" width="36" height="6" rx="3" fill="#453588" />

        {/* main progress card */}
        <rect x="294" y="276" width="100" height="38" rx="6" fill="#2A2650" />
        {/* circular progress */}
        <circle cx="312" cy="295" r="11" stroke="#3A3568" strokeWidth="3" fill="none" />
        <circle cx="312" cy="295" r="11" stroke="url(#ill-cta)" strokeWidth="3" strokeLinecap="round" strokeDasharray="44 25" fill="none" />
        <text x="312" y="299" textAnchor="middle" fontSize="8" fontWeight="700" fill="#B9AEE8" fontFamily="Poppins, sans-serif">72%</text>
        <rect x="328" y="285" width="58" height="5" rx="2.5" fill="#B9AEE8" opacity="0.7" />
        <rect x="328" y="294" width="42" height="5" rx="2.5" fill="#665C9E" opacity="0.7" />
        <rect x="328" y="303" width="30" height="4" rx="2" fill="#453588" />

        {/* lesson rows */}
        <rect x="294" y="318" width="100" height="8" rx="4" fill="#3A3568" />
        <circle cx="302" cy="322" r="3.5" fill="#34D399" />
        <rect x="310" y="320" width="58" height="4" rx="2" fill="#665C9E" />

        <rect x="294" y="330" width="100" height="8" rx="4" fill="#3A3568" />
        <circle cx="302" cy="334" r="3.5" fill="#453588" />
        <rect x="310" y="332" width="46" height="4" rx="2" fill="#504A78" />

        {/* laptop base/keyboard area */}
        <rect x="252" y="348" width="164" height="18" rx="8" fill="url(#ill-laptopBase)" />
        <rect x="262" y="352" width="144" height="5" rx="2.5" fill="#B9AED8" opacity="0.6" />
        {/* trackpad */}
        <rect x="310" y="349" width="40" height="3" rx="1.5" fill="#C4BCE0" opacity="0.5" />
        {/* hinge */}
        <rect x="318" y="346" width="28" height="5" rx="2.5" fill="#8A76D8" opacity="0.7" />
      </g>

      {/* arms reaching to keyboard — with hoodie sleeves */}
      <path d="M250 252 C 248 298 260 340 276 350" stroke="url(#ill-hoodieShadow)" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M250 252 C 248 298 260 340 276 350" stroke="url(#ill-hoodie)" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M400 252 C 402 298 390 340 374 350" stroke="url(#ill-hoodieShadow)" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M400 252 C 402 298 390 340 374 350" stroke="url(#ill-hoodie)" strokeWidth="13" strokeLinecap="round" fill="none" />
      {/* hands */}
      <circle cx="276" cy="352" r="7" fill="url(#ill-skin)" />
      <circle cx="374" cy="352" r="7" fill="url(#ill-skin)" />
      {/* finger detail */}
      <ellipse cx="272" cy="355" rx="3" ry="4" fill="#E8B892" opacity="0.5" />
      <ellipse cx="378" cy="355" rx="3" ry="4" fill="#E8B892" opacity="0.5" />
    </svg>
  )
}
