// American Traditional style tattoo SVG designs with transparent backgrounds
// These SVGs have no background fill, making them perfect for AR overlay

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

const roseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <path d="M100 215 Q97 195 96 172 Q95 158 100 148 Q105 158 104 172 Q103 195 100 215Z" fill="#2d7a3a" stroke="#111" stroke-width="2.5"/>
  <path d="M96 178 Q76 172 62 156 Q68 152 77 156 Q88 162 96 178Z" fill="#2d7a3a" stroke="#111" stroke-width="2.5"/>
  <path d="M104 192 Q124 182 138 164 Q132 160 123 165 Q112 172 104 192Z" fill="#2d7a3a" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="100" cy="55" rx="18" ry="14" fill="#d42244" stroke="#111" stroke-width="3"/>
  <path d="M65 85 Q70 60 100 55 Q130 60 135 85 Q125 75 100 72 Q75 75 65 85Z" fill="#cc2040" stroke="#111" stroke-width="3"/>
  <path d="M60 105 Q65 82 100 78 Q135 82 140 105 Q130 92 100 90 Q70 92 60 105Z" fill="#d42244" stroke="#111" stroke-width="3"/>
  <path d="M58 120 Q65 100 100 97 Q135 100 142 120 Q130 110 100 108 Q70 110 58 120Z" fill="#bb1a35" stroke="#111" stroke-width="2.5"/>
  <path d="M62 135 Q100 148 138 135 Q130 125 100 122 Q70 125 62 135Z" fill="#bb1a35" stroke="#111" stroke-width="3"/>
  <ellipse cx="100" cy="128" rx="38" ry="40" fill="none" stroke="#111" stroke-width="3.5"/>
  <path d="M82 90 Q100 82 118 90" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M78 110 Q100 100 122 110" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M80 130 Q100 120 120 130" fill="none" stroke="#111" stroke-width="2"/>
  <ellipse cx="100" cy="105" rx="22" ry="24" fill="#9e1028" stroke="#111" stroke-width="3"/>
  <path d="M93 95 Q100 88 107 95 Q100 108 93 95Z" fill="#cc2244" stroke="none"/>
  <path d="M55 98 Q45 82 58 68 Q52 78 55 98Z" fill="#d42244" stroke="#111" stroke-width="2.5"/>
  <path d="M145 98 Q155 82 142 68 Q148 78 145 98Z" fill="#d42244" stroke="#111" stroke-width="2.5"/>
  <line x1="96" y1="160" x2="91" y2="153" stroke="#2d7a3a" stroke-width="2"/>
  <path d="M100 148 Q98 165 100 215" fill="none" stroke="#2d7a3a" stroke-width="4.5" stroke-linecap="round"/>
</svg>`;

const skullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <ellipse cx="100" cy="95" rx="62" ry="70" fill="#f0e8d8" stroke="#111" stroke-width="4"/>
  <rect x="68" y="155" width="64" height="32" rx="8" fill="#f0e8d8" stroke="#111" stroke-width="3.5"/>
  <line x1="100" y1="155" x2="100" y2="187" stroke="#111" stroke-width="3"/>
  <line x1="80" y1="162" x2="80" y2="180" stroke="#111" stroke-width="2.5"/>
  <line x1="90" y1="162" x2="90" y2="180" stroke="#111" stroke-width="2.5"/>
  <line x1="110" y1="162" x2="110" y2="180" stroke="#111" stroke-width="2.5"/>
  <line x1="120" y1="162" x2="120" y2="180" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="78" cy="108" rx="22" ry="24" fill="#111" stroke="#111" stroke-width="3"/>
  <ellipse cx="122" cy="108" rx="22" ry="24" fill="#111" stroke="#111" stroke-width="3"/>
  <ellipse cx="78" cy="108" rx="12" ry="13" fill="#1a1a2e"/>
  <ellipse cx="122" cy="108" rx="12" ry="13" fill="#1a1a2e"/>
  <ellipse cx="72" cy="102" rx="4" ry="3" fill="white" opacity="0.7"/>
  <ellipse cx="116" cy="102" rx="4" ry="3" fill="white" opacity="0.7"/>
  <path d="M88 140 Q100 148 112 140" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
  <path d="M95 52 Q100 42 105 52" fill="none" stroke="#111" stroke-width="2.5"/>
  <path d="M78 58 Q82 48 86 58" fill="none" stroke="#111" stroke-width="2.5"/>
  <path d="M114 58 Q118 48 122 58" fill="none" stroke="#111" stroke-width="2.5"/>
  <path d="M55 90 Q38 85 40 70 Q42 55 55 58" fill="none" stroke="#111" stroke-width="3"/>
  <path d="M145 90 Q162 85 160 70 Q158 55 145 58" fill="none" stroke="#111" stroke-width="3"/>
  <path d="M85 138 L88 148" stroke="#111" stroke-width="2.5"/>
  <path d="M100 140 L100 150" stroke="#111" stroke-width="2.5"/>
  <path d="M115 138 L112 148" stroke="#111" stroke-width="2.5"/>
  <path d="M70 155 L68 162" stroke="#111" stroke-width="2.5"/>
  <path d="M130 155 L132 162" stroke="#111" stroke-width="2.5"/>
</svg>`;

const geometricSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <polygon points="100,20 185,65 185,155 100,200 15,155 15,65" fill="none" stroke="#111" stroke-width="4"/>
  <polygon points="100,38 168,78 168,158 100,198 32,158 32,78" fill="none" stroke="#111" stroke-width="2.5"/>
  <polygon points="100,58 152,88 152,148 100,178 48,148 48,88" fill="none" stroke="#028a7b" stroke-width="3.5"/>
  <line x1="100" y1="20" x2="100" y2="200" stroke="#111" stroke-width="2"/>
  <line x1="15" y1="65" x2="185" y2="155" stroke="#111" stroke-width="2"/>
  <line x1="185" y1="65" x2="15" y2="155" stroke="#111" stroke-width="2"/>
  <circle cx="100" cy="110" r="28" fill="none" stroke="#028a7b" stroke-width="3"/>
  <circle cx="100" cy="110" r="16" fill="#028a7b" stroke="#111" stroke-width="3"/>
  <circle cx="100" cy="110" r="8" fill="#111" stroke="none"/>
  <polygon points="100,82 106,98 124,98 110,108 115,126 100,116 85,126 90,108 76,98 94,98" fill="none" stroke="#111" stroke-width="2.5"/>
  <circle cx="100" cy="20" r="5" fill="#111"/>
  <circle cx="185" cy="65" r="5" fill="#111"/>
  <circle cx="185" cy="155" r="5" fill="#111"/>
  <circle cx="100" cy="200" r="5" fill="#111"/>
  <circle cx="15" cy="155" r="5" fill="#111"/>
  <circle cx="15" cy="65" r="5" fill="#111"/>
</svg>`;

const lotusSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <path d="M100 200 Q80 185 75 165 Q80 170 100 200Z" fill="#2d7a3a" stroke="#111" stroke-width="2.5"/>
  <path d="M100 200 Q120 185 125 165 Q120 170 100 200Z" fill="#2d7a3a" stroke="#111" stroke-width="2.5"/>
  <line x1="100" y1="165" x2="100" y2="200" stroke="#2d7a3a" stroke-width="4" stroke-linecap="round"/>
  <path d="M55 155 Q50 130 62 110 Q72 125 70 155Z" fill="#e8729a" stroke="#111" stroke-width="3"/>
  <path d="M145 155 Q150 130 138 110 Q128 125 130 155Z" fill="#e8729a" stroke="#111" stroke-width="3"/>
  <path d="M70 150 Q65 118 82 96 Q96 112 92 150Z" fill="#f090b0" stroke="#111" stroke-width="3"/>
  <path d="M130 150 Q135 118 118 96 Q104 112 108 150Z" fill="#f090b0" stroke="#111" stroke-width="3"/>
  <path d="M85 148 Q80 108 100 85 Q120 108 115 148Z" fill="#faaec4" stroke="#111" stroke-width="3.5"/>
  <ellipse cx="100" cy="148" rx="28" ry="12" fill="#f8ccd8" stroke="#111" stroke-width="3"/>
  <circle cx="100" cy="148" r="10" fill="#f5b8c8" stroke="#111" stroke-width="2.5"/>
  <circle cx="100" cy="148" r="5" fill="#e06080" stroke="#111" stroke-width="2"/>
  <path d="M55 155 Q40 145 38 128 Q50 132 55 155Z" fill="#d45a85" stroke="#111" stroke-width="2.5"/>
  <path d="M145 155 Q160 145 162 128 Q150 132 145 155Z" fill="#d45a85" stroke="#111" stroke-width="2.5"/>
</svg>`;

const mandalaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
  <circle cx="110" cy="110" r="100" fill="none" stroke="#111" stroke-width="3"/>
  <circle cx="110" cy="110" r="88" fill="none" stroke="#028a7b" stroke-width="2"/>
  <circle cx="110" cy="110" r="72" fill="none" stroke="#111" stroke-width="3"/>
  <circle cx="110" cy="110" r="55" fill="none" stroke="#028a7b" stroke-width="2"/>
  <circle cx="110" cy="110" r="38" fill="none" stroke="#111" stroke-width="3"/>
  <circle cx="110" cy="110" r="22" fill="none" stroke="#028a7b" stroke-width="2"/>
  <circle cx="110" cy="110" r="10" fill="#028a7b" stroke="#111" stroke-width="2.5"/>
  <g stroke="#111" stroke-width="2.5">
    <line x1="110" y1="10" x2="110" y2="210"/>
    <line x1="10" y1="110" x2="210" y2="110"/>
    <line x1="39" y1="39" x2="181" y2="181"/>
    <line x1="181" y1="39" x2="39" y2="181"/>
  </g>
  <g fill="none" stroke="#111" stroke-width="2.5">
    <path d="M110 22 Q120 55 110 72 Q100 55 110 22Z"/>
    <path d="M110 148 Q120 165 110 198 Q100 165 110 148Z"/>
    <path d="M22 110 Q55 120 72 110 Q55 100 22 110Z"/>
    <path d="M148 110 Q165 120 198 110 Q165 100 148 110Z"/>
    <path d="M46 46 Q68 68 60 82 Q48 70 46 46Z"/>
    <path d="M174 46 Q152 68 160 82 Q172 70 174 46Z"/>
    <path d="M46 174 Q68 152 60 138 Q48 150 46 174Z"/>
    <path d="M174 174 Q152 152 160 138 Q172 150 174 174Z"/>
  </g>
  <g fill="#028a7b" stroke="#111" stroke-width="2">
    <polygon points="110,75 114,86 125,86 116,93 120,104 110,97 100,104 104,93 95,86 106,86"/>
    <polygon points="110,55 112,60 118,60 113,64 115,70 110,66 105,70 107,64 102,60 108,60"/>
  </g>
  <g fill="none" stroke="#028a7b" stroke-width="1.5">
    <line x1="110" y1="34" x2="110" y2="22"/>
    <line x1="186" y1="110" x2="198" y2="110"/>
    <line x1="34" y1="110" x2="22" y2="110"/>
    <line x1="110" y1="186" x2="110" y2="198"/>
    <line x1="58" y1="58" x2="50" y2="50"/>
    <line x1="162" y1="58" x2="170" y2="50"/>
    <line x1="58" y1="162" x2="50" y2="170"/>
    <line x1="162" y1="162" x2="170" y2="170"/>
  </g>
</svg>`;

const dragonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <path d="M100 240 Q90 220 85 200 Q82 185 88 172 Q92 165 100 162 Q108 165 112 172 Q118 185 115 200 Q110 220 100 240Z" fill="#1a6b2a" stroke="#111" stroke-width="3"/>
  <path d="M88 172 Q70 165 58 150 Q65 148 75 155 Q85 162 88 172Z" fill="#1a6b2a" stroke="#111" stroke-width="2.5"/>
  <path d="M112 172 Q130 165 142 150 Q135 148 125 155 Q115 162 112 172Z" fill="#1a6b2a" stroke="#111" stroke-width="2.5"/>
  <path d="M100 162 Q85 145 75 120 Q80 115 90 125 Q95 135 100 145 Q105 135 110 125 Q120 115 125 120 Q115 145 100 162Z" fill="#2d8a3a" stroke="#111" stroke-width="3"/>
  <path d="M75 120 Q55 105 40 80 Q50 75 62 88 Q70 98 75 120Z" fill="#2d8a3a" stroke="#111" stroke-width="2.5"/>
  <path d="M125 120 Q145 105 160 80 Q150 75 138 88 Q130 98 125 120Z" fill="#2d8a3a" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="100" cy="65" rx="42" ry="38" fill="#2d8a3a" stroke="#111" stroke-width="4"/>
  <path d="M78 42 Q85 28 92 38 Q88 32 78 42Z" fill="#111" stroke="#111" stroke-width="2"/>
  <path d="M122 42 Q115 28 108 38 Q112 32 122 42Z" fill="#111" stroke="#111" stroke-width="2"/>
  <ellipse cx="88" cy="60" rx="12" ry="10" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="112" cy="60" rx="12" ry="10" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="88" cy="60" rx="5" ry="8" fill="#111"/>
  <ellipse cx="112" cy="60" rx="5" ry="8" fill="#111"/>
  <path d="M78 78 Q100 92 122 78" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
  <path d="M85 82 L82 92 M92 86 L90 96 M100 88 L100 98 M108 86 L110 96 M115 82 L118 92" stroke="#111" stroke-width="2"/>
  <path d="M58 68 Q45 60 42 50 Q52 54 58 68Z" fill="#cc2222" stroke="#111" stroke-width="2.5"/>
  <path d="M142 68 Q155 60 158 50 Q148 54 142 68Z" fill="#cc2222" stroke="#111" stroke-width="2.5"/>
  <path d="M95 72 L88 82 M105 72 L112 82" stroke="#111" stroke-width="2"/>
</svg>`;

const moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <path d="M110 30 Q158 58 158 120 Q158 178 110 210 Q148 205 170 175 Q192 145 192 120 Q192 72 155 48 Q138 36 110 30Z" fill="#f5e070" stroke="#111" stroke-width="4"/>
  <path d="M110 30 Q100 35 92 45 Q84 58 80 72 Q76 88 78 105 Q80 125 90 142 Q100 158 110 168 Q118 158 122 142 Q128 122 126 102 Q124 82 118 65 Q113 48 110 30Z" fill="#f5c518" stroke="#111" stroke-width="3"/>
  <circle cx="55" cy="55" r="8" fill="#f5e070" stroke="#111" stroke-width="3"/>
  <path d="M55 47 L55 38 M63 51 L70 44 M67 59 L76 59 M63 67 L70 74 M55 71 L55 80 M47 67 L40 74 M43 59 L34 59 M47 51 L40 44" fill="none" stroke="#111" stroke-width="2.5"/>
  <circle cx="42" cy="120" r="5" fill="#f5e070" stroke="#111" stroke-width="2.5"/>
  <path d="M42 115 L42 108 M47 118 L52 113 M47 122 L52 127 M42 125 L42 132 M37 122 L32 127 M37 118 L32 113" fill="none" stroke="#111" stroke-width="2"/>
  <circle cx="70" cy="185" r="6" fill="#f5e070" stroke="#111" stroke-width="2.5"/>
  <path d="M70 179 L70 170 M76 182 L83 175 M76 188 L83 195 M70 191 L70 200 M64 188 L57 195 M64 182 L57 175" fill="none" stroke="#111" stroke-width="2"/>
  <circle cx="165" cy="55" r="4" fill="#f5e070" stroke="#111" stroke-width="2"/>
  <circle cx="178" cy="90" r="3" fill="#f5e070" stroke="#111" stroke-width="2"/>
  <circle cx="40" cy="88" r="3" fill="#f5e070" stroke="#111" stroke-width="2"/>
  <circle cx="60" cy="150" r="2.5" fill="#f5e070" stroke="#111" stroke-width="1.5"/>
</svg>`;

const wolfSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <path d="M62 75 Q55 45 45 30 Q55 50 68 60Z" fill="#888" stroke="#111" stroke-width="3"/>
  <path d="M138 75 Q145 45 155 30 Q145 50 132 60Z" fill="#888" stroke="#111" stroke-width="3"/>
  <ellipse cx="100" cy="105" rx="60" ry="68" fill="#aaa" stroke="#111" stroke-width="4"/>
  <path d="M58 82 Q55 68 62 75 Q65 80 68 88Z" fill="#ccc" stroke="#111" stroke-width="2.5"/>
  <path d="M142 82 Q145 68 138 75 Q135 80 132 88Z" fill="#ccc" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="100" cy="90" rx="40" ry="35" fill="#ccc" stroke="#111" stroke-width="3"/>
  <ellipse cx="82" cy="88" rx="14" ry="15" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="118" cy="88" rx="14" ry="15" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="82" cy="88" rx="7" ry="10" fill="#111"/>
  <ellipse cx="118" cy="88" rx="7" ry="10" fill="#111"/>
  <ellipse cx="79" cy="83" rx="3" ry="2" fill="white" opacity="0.8"/>
  <ellipse cx="115" cy="83" rx="3" ry="2" fill="white" opacity="0.8"/>
  <path d="M92 108 Q100 112 108 108" fill="none" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="100" cy="118" rx="18" ry="10" fill="#c4a0a0" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="100" cy="118" rx="10" ry="6" fill="#e0b0b0"/>
  <path d="M92 112 L88 118 L92 124" stroke="#111" stroke-width="2" fill="none"/>
  <path d="M108 112 L112 118 L108 124" stroke="#111" stroke-width="2" fill="none"/>
  <path d="M65 100 Q50 100 45 88" fill="none" stroke="#111" stroke-width="2.5"/>
  <path d="M135 100 Q150 100 155 88" fill="none" stroke="#111" stroke-width="2.5"/>
  <path d="M72 115 Q65 120 68 128" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M128 115 Q135 120 132 128" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M60 110 Q55 118 60 125 Q65 118 60 110Z" fill="#aaa" stroke="#111" stroke-width="2"/>
  <path d="M140 110 Q145 118 140 125 Q135 118 140 110Z" fill="#aaa" stroke="#111" stroke-width="2"/>
</svg>`;

const phoenixSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <path d="M100 240 Q92 220 88 200 Q85 185 90 172 Q95 162 100 158 Q105 162 110 172 Q115 185 112 200 Q108 220 100 240Z" fill="#cc4400" stroke="#111" stroke-width="3"/>
  <path d="M88 175 Q72 170 62 155 Q55 140 58 125 Q75 140 80 158 Q84 168 88 175Z" fill="#e05500" stroke="#111" stroke-width="2.5"/>
  <path d="M112 175 Q128 170 138 155 Q145 140 142 125 Q125 140 120 158 Q116 168 112 175Z" fill="#e05500" stroke="#111" stroke-width="2.5"/>
  <path d="M58 125 Q42 115 35 95 Q40 92 48 100 Q55 110 58 125Z" fill="#f57800" stroke="#111" stroke-width="2.5"/>
  <path d="M142 125 Q158 115 165 95 Q160 92 152 100 Q145 110 142 125Z" fill="#f57800" stroke="#111" stroke-width="2.5"/>
  <path d="M35 95 Q25 75 32 55 Q38 58 40 70 Q42 82 35 95Z" fill="#f5a500" stroke="#111" stroke-width="2.5"/>
  <path d="M165 95 Q175 75 168 55 Q162 58 160 70 Q158 82 165 95Z" fill="#f5a500" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="100" cy="80" rx="38" ry="42" fill="#e05500" stroke="#111" stroke-width="4"/>
  <ellipse cx="100" cy="72" rx="22" ry="20" fill="#f5a500" stroke="#111" stroke-width="3"/>
  <path d="M90 52 Q100 38 110 52 Q100 46 90 52Z" fill="#cc4400" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="88" cy="72" rx="11" ry="11" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="112" cy="72" rx="11" ry="11" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="88" cy="72" rx="5" ry="6" fill="#111"/>
  <ellipse cx="112" cy="72" rx="5" ry="6" fill="#111"/>
  <path d="M88 95 Q100 102 112 95" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M78 90 Q72 85 68 90" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M122 90 Q128 85 132 90" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M32 55 Q38 42 50 40 Q44 48 32 55Z" fill="#f5c518" stroke="#111" stroke-width="2"/>
  <path d="M168 55 Q162 42 150 40 Q156 48 168 55Z" fill="#f5c518" stroke="#111" stroke-width="2"/>
  <path d="M100 155 Q90 145 85 130 Q95 125 100 140 Q105 125 115 130 Q110 145 100 155Z" fill="#cc4400" stroke="#111" stroke-width="2.5"/>
</svg>`;

const compassSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <circle cx="100" cy="112" r="85" fill="none" stroke="#111" stroke-width="4"/>
  <circle cx="100" cy="112" r="78" fill="none" stroke="#028a7b" stroke-width="2"/>
  <circle cx="100" cy="112" r="20" fill="#028a7b" stroke="#111" stroke-width="3"/>
  <circle cx="100" cy="112" r="8" fill="#111" stroke="none"/>
  <polygon points="100,27 107,90 100,100 93,90" fill="#cc2244" stroke="#111" stroke-width="3"/>
  <polygon points="100,197 107,134 100,124 93,134" fill="#f0e8d8" stroke="#111" stroke-width="3"/>
  <polygon points="15,112 78,105 88,112 78,119" fill="#f0e8d8" stroke="#111" stroke-width="3"/>
  <polygon points="185,112 122,105 112,112 122,119" fill="#f0e8d8" stroke="#111" stroke-width="3"/>
  <polygon points="140,51 118,103 112,108 108,100" fill="#f0e8d8" stroke="#111" stroke-width="2.5"/>
  <polygon points="60,51 82,103 88,108 92,100" fill="#cc2244" stroke="#111" stroke-width="2.5"/>
  <polygon points="140,173 118,121 112,116 108,124" fill="#f0e8d8" stroke="#111" stroke-width="2.5"/>
  <polygon points="60,173 82,121 88,116 92,124" fill="#f0e8d8" stroke="#111" stroke-width="2.5"/>
  <text x="100" y="20" text-anchor="middle" font-family="serif" font-weight="bold" font-size="14" fill="#111">N</text>
  <text x="100" y="218" text-anchor="middle" font-family="serif" font-weight="bold" font-size="14" fill="#111">S</text>
  <text x="8" y="117" text-anchor="middle" font-family="serif" font-weight="bold" font-size="14" fill="#111">W</text>
  <text x="192" y="117" text-anchor="middle" font-family="serif" font-weight="bold" font-size="14" fill="#111">E</text>
  <circle cx="100" cy="112" r="60" fill="none" stroke="#111" stroke-width="1.5" stroke-dasharray="5,4"/>
</svg>`;

const featherSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <path d="M100 240 Q98 215 95 190 Q92 165 90 140 Q95 135 100 130 Q105 135 110 140 Q108 165 105 190 Q102 215 100 240Z" fill="none" stroke="#111" stroke-width="3"/>
  <path d="M100 130 Q80 110 60 85 Q70 82 85 95 Q92 105 100 120Z" fill="#8dd7ca" stroke="#111" stroke-width="2.5"/>
  <path d="M100 130 Q120 110 140 85 Q130 82 115 95 Q108 105 100 120Z" fill="#8dd7ca" stroke="#111" stroke-width="2.5"/>
  <path d="M95 148 Q72 132 50 110 Q60 107 77 120 Q86 130 95 148Z" fill="#72aea3" stroke="#111" stroke-width="2.5"/>
  <path d="M105 148 Q128 132 150 110 Q140 107 123 120 Q114 130 105 148Z" fill="#72aea3" stroke="#111" stroke-width="2.5"/>
  <path d="M93 165 Q68 150 45 128 Q55 125 72 138 Q83 148 93 165Z" fill="#8dd7ca" stroke="#111" stroke-width="2.5"/>
  <path d="M107 165 Q132 150 155 128 Q145 125 128 138 Q117 148 107 165Z" fill="#8dd7ca" stroke="#111" stroke-width="2.5"/>
  <path d="M92 182 Q68 168 46 145 Q57 142 74 156 Q83 168 92 182Z" fill="#72aea3" stroke="#111" stroke-width="2.5"/>
  <path d="M108 182 Q132 168 154 145 Q143 142 126 156 Q117 168 108 182Z" fill="#72aea3" stroke="#111" stroke-width="2.5"/>
  <path d="M95 200 Q74 186 52 162 Q63 160 80 174 Q88 184 95 200Z" fill="#8dd7ca" stroke="#111" stroke-width="2.5"/>
  <path d="M105 200 Q126 186 148 162 Q137 160 120 174 Q112 184 105 200Z" fill="#8dd7ca" stroke="#111" stroke-width="2.5"/>
  <line x1="100" y1="40" x2="100" y2="240" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M100 40 Q80 55 55 55 Q72 48 100 40Z" fill="#028a7b" stroke="#111" stroke-width="2.5"/>
  <path d="M100 40 Q120 55 145 55 Q128 48 100 40Z" fill="#028a7b" stroke="#111" stroke-width="2.5"/>
  <path d="M100 55 Q78 68 50 70 Q68 62 100 55Z" fill="#028a7b" stroke="#111" stroke-width="2.5"/>
  <path d="M100 55 Q122 68 150 70 Q132 62 100 55Z" fill="#028a7b" stroke="#111" stroke-width="2.5"/>
  <path d="M100 70 Q78 82 52 85 Q70 76 100 70Z" fill="#028a7b" stroke="#111" stroke-width="2.5"/>
  <path d="M100 70 Q122 82 148 85 Q130 76 100 70Z" fill="#028a7b" stroke="#111" stroke-width="2.5"/>
</svg>`;

const tigerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <path d="M68 75 Q60 50 52 35 Q62 52 72 65Z" fill="#f57800" stroke="#111" stroke-width="3"/>
  <path d="M132 75 Q140 50 148 35 Q138 52 128 65Z" fill="#f57800" stroke="#111" stroke-width="3"/>
  <ellipse cx="100" cy="115" rx="62" ry="70" fill="#f57800" stroke="#111" stroke-width="4"/>
  <ellipse cx="100" cy="100" rx="42" ry="38" fill="#f5e0b8" stroke="#111" stroke-width="3"/>
  <path d="M78 80 Q72 70 68 75 Q74 76 78 80Z" fill="#f5e0b8" stroke="#111" stroke-width="2"/>
  <path d="M122 80 Q128 70 132 75 Q126 76 122 80Z" fill="#f5e0b8" stroke="#111" stroke-width="2"/>
  <path d="M62 95 Q55 88 58 80 Q64 85 62 95Z" fill="#111" stroke="#111" stroke-width="1.5"/>
  <path d="M72 82 Q68 70 72 65 Q76 72 72 82Z" fill="#111" stroke="#111" stroke-width="1.5"/>
  <path d="M85 80 Q84 68 88 65 Q90 73 85 80Z" fill="#111" stroke="#111" stroke-width="1.5"/>
  <path d="M138 95 Q145 88 142 80 Q136 85 138 95Z" fill="#111" stroke="#111" stroke-width="1.5"/>
  <path d="M128 82 Q132 70 128 65 Q124 72 128 82Z" fill="#111" stroke="#111" stroke-width="1.5"/>
  <path d="M115 80 Q116 68 112 65 Q110 73 115 80Z" fill="#111" stroke="#111" stroke-width="1.5"/>
  <path d="M100 88 Q88 84 85 78 Q90 85 100 88 Q110 85 115 78 Q112 84 100 88Z" fill="#111" stroke="#111" stroke-width="2"/>
  <ellipse cx="84" cy="100" rx="13" ry="14" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="116" cy="100" rx="13" ry="14" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="84" cy="100" rx="6" ry="9" fill="#111"/>
  <ellipse cx="116" cy="100" rx="6" ry="9" fill="#111"/>
  <ellipse cx="81" cy="96" rx="3" ry="2" fill="white" opacity="0.8"/>
  <ellipse cx="113" cy="96" rx="3" ry="2" fill="white" opacity="0.8"/>
  <path d="M82 120 Q100 128 118 120" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="100" cy="130" rx="16" ry="10" fill="#f5c5c5" stroke="#111" stroke-width="2.5"/>
  <path d="M100 122 L88 130 M100 122 L112 130" stroke="#111" stroke-width="2"/>
  <path d="M60 112 L42 108 M60 116 L42 118 M60 120 L42 128" stroke="#111" stroke-width="2.5"/>
  <path d="M140 112 L158 108 M140 116 L158 118 M140 120 L158 128" stroke="#111" stroke-width="2.5"/>
</svg>`;

const koiFishSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <path d="M100 240 Q88 225 82 210 Q78 200 82 192 Q88 185 100 182 Q112 185 118 192 Q122 200 118 210 Q112 225 100 240Z" fill="#cc2244" stroke="#111" stroke-width="3"/>
  <path d="M82 210 Q65 222 48 218 Q60 212 82 210Z" fill="#cc2244" stroke="#111" stroke-width="2.5"/>
  <path d="M118 210 Q135 222 152 218 Q140 212 118 210Z" fill="#cc2244" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="100" cy="115" rx="48" ry="72" fill="#e03355" stroke="#111" stroke-width="4"/>
  <path d="M65 90 Q55 78 58 64 Q68 72 65 90Z" fill="#f07090" stroke="#111" stroke-width="2.5"/>
  <path d="M135 90 Q145 78 142 64 Q132 72 135 90Z" fill="#f07090" stroke="#111" stroke-width="2.5"/>
  <path d="M65 115 Q52 108 50 95 Q62 100 65 115Z" fill="#f07090" stroke="#111" stroke-width="2.5"/>
  <path d="M135 115 Q148 108 150 95 Q138 100 135 115Z" fill="#f07090" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="100" cy="82" rx="24" ry="20" fill="#f0f0f0" stroke="#111" stroke-width="3"/>
  <g fill="none" stroke="#111" stroke-width="2">
    <path d="M78 100 Q90 92 100 100 Q110 92 122 100"/>
    <path d="M76 112 Q88 104 100 112 Q112 104 124 112"/>
    <path d="M74 124 Q86 116 100 124 Q114 116 126 124"/>
    <path d="M76 136 Q88 128 100 136 Q112 128 124 136"/>
    <path d="M78 148 Q90 140 100 148 Q110 140 122 148"/>
    <path d="M82 160 Q91 152 100 160 Q109 152 118 160"/>
    <path d="M86 172 Q93 164 100 172 Q107 164 114 172"/>
  </g>
  <ellipse cx="88" cy="78" rx="10" ry="9" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="88" cy="78" rx="5" ry="6" fill="#111"/>
  <ellipse cx="85" cy="75" rx="2.5" ry="2" fill="white" opacity="0.8"/>
  <path d="M98 68 Q100 62 102 68" stroke="#111" stroke-width="2" fill="none"/>
</svg>`;

const butterflySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <line x1="100" y1="25" x2="100" y2="185" stroke="#111" stroke-width="4" stroke-linecap="round"/>
  <path d="M100 90 Q55 55 30 30 Q20 55 28 78 Q38 102 65 112 Q82 118 100 110Z" fill="#e05500" stroke="#111" stroke-width="3.5"/>
  <path d="M100 90 Q145 55 170 30 Q180 55 172 78 Q162 102 135 112 Q118 118 100 110Z" fill="#e05500" stroke="#111" stroke-width="3.5"/>
  <path d="M100 110 Q72 130 55 148 Q52 162 62 170 Q75 165 88 152 Q96 140 100 130Z" fill="#f57800" stroke="#111" stroke-width="3"/>
  <path d="M100 110 Q128 130 145 148 Q148 162 138 170 Q125 165 112 152 Q104 140 100 130Z" fill="#f57800" stroke="#111" stroke-width="3"/>
  <g fill="none" stroke="#111" stroke-width="2">
    <circle cx="65" cy="70" r="18"/>
    <circle cx="65" cy="70" r="10"/>
    <circle cx="135" cy="70" r="18"/>
    <circle cx="135" cy="70" r="10"/>
    <circle cx="72" cy="142" r="10"/>
    <circle cx="128" cy="142" r="10"/>
  </g>
  <circle cx="65" cy="70" r="6" fill="#f5c518" stroke="#111" stroke-width="2"/>
  <circle cx="135" cy="70" r="6" fill="#f5c518" stroke="#111" stroke-width="2"/>
  <circle cx="72" cy="142" r="6" fill="#f5c518" stroke="#111" stroke-width="2"/>
  <circle cx="128" cy="142" r="6" fill="#f5c518" stroke="#111" stroke-width="2"/>
  <path d="M100 25 Q105 35 108 45" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M100 25 Q95 35 92 45" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="108" cy="46" r="3" fill="#111"/>
  <circle cx="92" cy="46" r="3" fill="#111"/>
</svg>`;

const scorpionSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <path d="M100 42 Q115 52 120 65 Q115 78 100 82 Q85 78 80 65 Q85 52 100 42Z" fill="#555" stroke="#111" stroke-width="3.5"/>
  <path d="M80 65 Q62 72 50 85 Q55 80 60 75 Q68 70 80 65Z" fill="#555" stroke="#111" stroke-width="2.5"/>
  <path d="M120 65 Q138 72 150 85 Q145 80 140 75 Q132 70 120 65Z" fill="#555" stroke="#111" stroke-width="2.5"/>
  <path d="M50 85 Q38 78 32 68 Q36 72 40 78 Q44 82 50 85Z" fill="#555" stroke="#111" stroke-width="2"/>
  <path d="M150 85 Q162 78 168 68 Q164 72 160 78 Q156 82 150 85Z" fill="#555" stroke="#111" stroke-width="2"/>
  <path d="M32 68 Q25 55 30 45 Q34 52 32 68Z" fill="#555" stroke="#111" stroke-width="2"/>
  <path d="M168 68 Q175 55 170 45 Q166 52 168 68Z" fill="#555" stroke="#111" stroke-width="2"/>
  <ellipse cx="80" cy="92" rx="12" ry="10" fill="#555" stroke="#111" stroke-width="3"/>
  <ellipse cx="120" cy="92" rx="12" ry="10" fill="#555" stroke="#111" stroke-width="3"/>
  <path d="M80 102 Q100 115 120 102" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
  <rect x="82" y="115" width="36" height="18" rx="6" fill="#555" stroke="#111" stroke-width="3"/>
  <rect x="84" y="133" width="32" height="16" rx="5" fill="#666" stroke="#111" stroke-width="2.5"/>
  <rect x="86" y="149" width="28" height="14" rx="4" fill="#555" stroke="#111" stroke-width="2.5"/>
  <rect x="88" y="163" width="24" height="12" rx="4" fill="#666" stroke="#111" stroke-width="2.5"/>
  <path d="M100 175 Q120 190 130 210 Q132 225 125 235 Q118 240 112 232 Q108 220 115 210 Q108 198 100 188Z" fill="#555" stroke="#111" stroke-width="3"/>
  <path d="M112 232 Q110 245 100 248 Q98 242 108 235Z" fill="#cc2244" stroke="#111" stroke-width="2.5"/>
  <path d="M80 92 Q65 88 58 80 M80 96 Q62 96 55 92 M80 100 Q63 104 58 110" stroke="#111" stroke-width="2"/>
  <path d="M120 92 Q135 88 142 80 M120 96 Q138 96 145 92 M120 100 Q137 104 142 110" stroke="#111" stroke-width="2"/>
</svg>`;

const wingsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200">
  <path d="M120 100 Q100 90 75 75 Q55 62 35 55 Q20 52 12 58 Q8 68 15 78 Q25 90 45 95 Q60 98 80 95 Q100 92 120 100Z" fill="#f0e8d8" stroke="#111" stroke-width="3.5"/>
  <path d="M120 100 Q140 90 165 75 Q185 62 205 55 Q220 52 228 58 Q232 68 225 78 Q215 90 195 95 Q180 98 160 95 Q140 92 120 100Z" fill="#f0e8d8" stroke="#111" stroke-width="3.5"/>
  <path d="M15 78 Q8 95 16 108 Q28 115 45 108 Q62 100 80 95" fill="none" stroke="#111" stroke-width="3"/>
  <path d="M225 78 Q232 95 224 108 Q212 115 195 108 Q178 100 160 95" fill="none" stroke="#111" stroke-width="3"/>
  <path d="M16 108 Q14 125 22 135 Q35 142 52 135 Q68 125 80 115 Q95 105 120 108Z" fill="#f0e8d8" stroke="#111" stroke-width="3"/>
  <path d="M224 108 Q226 125 218 135 Q205 142 188 135 Q172 125 160 115 Q145 105 120 108Z" fill="#f0e8d8" stroke="#111" stroke-width="3"/>
  <g fill="none" stroke="#111" stroke-width="2">
    <path d="M35 55 L28 72"/>
    <path d="M50 52 L45 70"/>
    <path d="M65 55 L62 75"/>
    <path d="M80 60 L78 80"/>
    <path d="M95 65 L95 85"/>
    <path d="M110 70 L112 90"/>
    <path d="M205 55 L212 72"/>
    <path d="M190 52 L195 70"/>
    <path d="M175 55 L178 75"/>
    <path d="M160 60 L162 80"/>
    <path d="M145 65 L145 85"/>
    <path d="M130 70 L128 90"/>
    <path d="M28 90 L22 108"/>
    <path d="M42 95 L38 112"/>
    <path d="M58 95 L56 112"/>
    <path d="M72 93 L72 110"/>
    <path d="M212 90 L218 108"/>
    <path d="M198 95 L202 112"/>
    <path d="M182 95 L184 112"/>
    <path d="M168 93 L168 110"/>
    <path d="M28 118 L24 135"/>
    <path d="M42 122 L40 138"/>
    <path d="M58 120 L58 136"/>
    <path d="M72 118 L74 133"/>
    <path d="M212 118 L216 135"/>
    <path d="M198 122 L200 138"/>
    <path d="M182 120 L182 136"/>
    <path d="M168 118 L166 133"/>
  </g>
  <ellipse cx="120" cy="105" rx="12" ry="15" fill="#028a7b" stroke="#111" stroke-width="3"/>
  <ellipse cx="120" cy="105" rx="6" ry="8" fill="#111"/>
</svg>`;

const anchorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <circle cx="100" cy="48" r="22" fill="none" stroke="#111" stroke-width="5"/>
  <circle cx="100" cy="48" r="12" fill="#028a7b" stroke="#111" stroke-width="3.5"/>
  <line x1="100" y1="70" x2="100" y2="220" stroke="#111" stroke-width="6" stroke-linecap="round"/>
  <line x1="58" y1="130" x2="142" y2="130" stroke="#111" stroke-width="5" stroke-linecap="round"/>
  <path d="M100 220 Q75 215 58 200 Q68 210 80 215 Q90 218 100 220Z" fill="#028a7b" stroke="#111" stroke-width="4" stroke-linecap="round"/>
  <path d="M100 220 Q125 215 142 200 Q132 210 120 215 Q110 218 100 220Z" fill="#028a7b" stroke="#111" stroke-width="4" stroke-linecap="round"/>
  <path d="M58 200 Q45 185 48 168 Q55 175 58 200Z" fill="#028a7b" stroke="#111" stroke-width="3"/>
  <path d="M142 200 Q155 185 152 168 Q145 175 142 200Z" fill="#028a7b" stroke="#111" stroke-width="3"/>
  <path d="M48 168 Q55 150 58 130 M152 168 Q145 150 142 130" fill="none" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M58 130 Q52 118 48 108" fill="none" stroke="#cc2244" stroke-width="4" stroke-linecap="round"/>
  <path d="M48 108 Q42 98 44 90 Q50 96 52 106 Q55 115 58 124" fill="none" stroke="#cc2244" stroke-width="4"/>
  <path d="M142 130 Q148 118 152 108" fill="none" stroke="#cc2244" stroke-width="4" stroke-linecap="round"/>
  <path d="M152 108 Q158 98 156 90 Q150 96 148 106 Q145 115 142 124" fill="none" stroke="#cc2244" stroke-width="4"/>
  <line x1="76" y1="28" x2="124" y2="28" stroke="#111" stroke-width="4" stroke-linecap="round"/>
</svg>`;

const eagleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <path d="M72 75 Q60 50 52 35 Q65 48 75 65Z" fill="#5a3010" stroke="#111" stroke-width="3"/>
  <path d="M128 75 Q140 50 148 35 Q135 48 125 65Z" fill="#5a3010" stroke="#111" stroke-width="3"/>
  <ellipse cx="100" cy="115" rx="62" ry="68" fill="#8b5e2a" stroke="#111" stroke-width="4"/>
  <ellipse cx="100" cy="95" rx="42" ry="38" fill="#f5e8d0" stroke="#111" stroke-width="3"/>
  <path d="M75 82 Q68 72 72 65 Q78 72 75 82Z" fill="#f5e8d0" stroke="#111" stroke-width="2"/>
  <path d="M125 82 Q132 72 128 65 Q122 72 125 82Z" fill="#f5e8d0" stroke="#111" stroke-width="2"/>
  <ellipse cx="84" cy="97" rx="13" ry="14" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="116" cy="97" rx="13" ry="14" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="84" cy="97" rx="6" ry="8" fill="#111"/>
  <ellipse cx="116" cy="97" rx="6" ry="8" fill="#111"/>
  <ellipse cx="81" cy="92" rx="3" ry="2" fill="white" opacity="0.8"/>
  <ellipse cx="113" cy="92" rx="3" ry="2" fill="white" opacity="0.8"/>
  <path d="M86 118 Q100 125 114 118" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M92 122 Q100 135 108 122" fill="#f5c518" stroke="#111" stroke-width="3"/>
  <path d="M100 128 L100 138" stroke="#111" stroke-width="2.5"/>
  <path d="M62 92 Q48 88 40 78 Q48 82 62 92Z" fill="#8b5e2a" stroke="#111" stroke-width="2.5"/>
  <path d="M138 92 Q152 88 160 78 Q152 82 138 92Z" fill="#8b5e2a" stroke="#111" stroke-width="2.5"/>
  <path d="M62 105 Q45 105 38 95 Q46 100 62 105Z" fill="#8b5e2a" stroke="#111" stroke-width="2.5"/>
  <path d="M138 105 Q155 105 162 95 Q154 100 138 105Z" fill="#8b5e2a" stroke="#111" stroke-width="2.5"/>
  <path d="M65 118 Q48 122 42 112 Q50 115 65 118Z" fill="#8b5e2a" stroke="#111" stroke-width="2"/>
  <path d="M135 118 Q152 122 158 112 Q150 115 135 118Z" fill="#8b5e2a" stroke="#111" stroke-width="2"/>
</svg>`;

const snakeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <path d="M100 30 Q120 32 132 42 Q142 55 138 70 Q132 84 118 88 Q102 92 88 86 Q72 78 68 62 Q65 45 78 35 Q88 28 100 30Z" fill="#2d7a3a" stroke="#111" stroke-width="4"/>
  <path d="M100 30 Q110 22 122 20 Q130 22 132 30 Q128 28 120 28 Q110 28 100 30Z" fill="#2d7a3a" stroke="#111" stroke-width="3"/>
  <ellipse cx="88" cy="50" rx="10" ry="11" fill="#f5c518" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="88" cy="50" rx="5" ry="7" fill="#111"/>
  <ellipse cx="85" cy="47" rx="2.5" ry="1.8" fill="white" opacity="0.8"/>
  <path d="M80 70 Q100 76 116 70" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M78 62 Q72 68 70 76 L74 76 L78 68 L82 76 L78 62Z" fill="#cc2244" stroke="#111" stroke-width="1.5"/>
  <g fill="#2d7a3a" stroke="#111" stroke-width="2.5">
    <path d="M68 62 Q55 68 48 82 Q45 95 52 108 Q62 120 76 122 Q88 122 96 112 Q104 100 102 88 Q68 62 68 62Z"/>
  </g>
  <path d="M52 108 Q42 120 45 135 Q52 148 66 152 Q80 155 90 145 Q100 132 96 118 Q52 108 52 108Z" fill="#3d9a4a" stroke="#111" stroke-width="2.5"/>
  <path d="M45 135 Q38 148 42 162 Q50 175 65 178 Q80 180 88 168 Q95 154 90 140 Q45 135 45 135Z" fill="#2d7a3a" stroke="#111" stroke-width="2.5"/>
  <path d="M42 162 Q38 178 44 192 Q55 205 70 206 Q85 205 90 192 Q94 178 88 165 Q42 162 42 162Z" fill="#3d9a4a" stroke="#111" stroke-width="2.5"/>
  <path d="M44 192 Q42 208 50 220 Q62 232 76 230 Q88 226 90 212 Q90 198 88 190 Q44 192 44 192Z" fill="#2d7a3a" stroke="#111" stroke-width="2.5"/>
  <g fill="none" stroke="#111" stroke-width="1.5">
    <path d="M68 75 Q80 70 95 72"/>
    <path d="M55 95 Q66 90 80 92"/>
    <path d="M48 118 Q60 113 74 116"/>
    <path d="M44 142 Q56 137 70 140"/>
    <path d="M42 168 Q55 163 68 166"/>
    <path d="M46 195 Q58 190 70 193"/>
    <path d="M50 218 Q62 214 73 216"/>
  </g>
</svg>`;

const heartSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <path d="M100 185 Q70 160 52 138 Q32 112 32 88 Q32 62 52 48 Q70 35 90 42 Q96 45 100 52 Q104 45 110 42 Q130 35 148 48 Q168 62 168 88 Q168 112 148 138 Q130 160 100 185Z" fill="#cc2244" stroke="#111" stroke-width="5"/>
  <path d="M100 170 Q76 148 60 128 Q45 108 46 88 Q47 68 62 58 Q78 48 92 54 Q96 57 100 64 Q104 57 108 54 Q122 48 138 58 Q153 68 154 88 Q155 108 140 128 Q124 148 100 170Z" fill="#e03355" stroke="none"/>
  <path d="M80 55 Q85 48 92 48" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
  <path d="M120 55 Q115 48 108 48" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
  <path d="M50 80 Q45 90 46 100" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M60 185 Q100 212 140 185" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
  <path d="M55 175 Q100 205 145 175" fill="none" stroke="#cc2244" stroke-width="3.5" stroke-linecap="round"/>
  <ellipse cx="100" cy="205" rx="45" ry="12" fill="#f5c518" stroke="#111" stroke-width="3"/>
  <path d="M65 205 Q100 200 135 205 Q100 210 65 205Z" fill="#e5b010" stroke="none"/>
  <path d="M58 202 Q100 215 142 202" fill="none" stroke="#111" stroke-width="2"/>
  <text x="100" y="140" text-anchor="middle" font-family="serif" font-weight="bold" font-size="18" fill="#111" letter-spacing="2">MOM</text>
  <path d="M72 148 Q100 155 128 148" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M68 152 Q100 160 132 152" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M70 156 Q100 163 130 156" fill="none" stroke="#111" stroke-width="2"/>
</svg>`;

export const tattooSvgDataUrls: Record<string, string> = {
  rose: svgToDataUrl(roseSvg),
  skull: svgToDataUrl(skullSvg),
  geometric: svgToDataUrl(geometricSvg),
  lotus: svgToDataUrl(lotusSvg),
  mandala: svgToDataUrl(mandalaSvg),
  dragon: svgToDataUrl(dragonSvg),
  moon: svgToDataUrl(moonSvg),
  wolf: svgToDataUrl(wolfSvg),
  phoenix: svgToDataUrl(phoenixSvg),
  compass: svgToDataUrl(compassSvg),
  feather: svgToDataUrl(featherSvg),
  tiger: svgToDataUrl(tigerSvg),
  koiFish: svgToDataUrl(koiFishSvg),
  butterfly: svgToDataUrl(butterflySvg),
  scorpion: svgToDataUrl(scorpionSvg),
  wings: svgToDataUrl(wingsSvg),
  anchor: svgToDataUrl(anchorSvg),
  eagle: svgToDataUrl(eagleSvg),
  snake: svgToDataUrl(snakeSvg),
  heart: svgToDataUrl(heartSvg),
};
