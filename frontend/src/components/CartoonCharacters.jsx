import React from 'react';

/**
 * Friendly 2D Cartoon Character Components for MediCycle
 * - DoctorMedi: A friendly 2D doctor / pharmacist with a stethoscope, glasses, clipboard & waving hand.
 * - PipThePill: A joyful 2D capsule mascot wearing medical glasses and thumbs up.
 * - EcoSprout: A cute green leaf & shield companion mascot for sustainability.
 */

// 1. DOCTOR MEDI - Friendly smiling pharmacist/doctor waving
export const DoctorMedi = ({ className = "w-48 h-48" }) => {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Doctor Medi cartoon character"
    >
      {/* Soft Ambient Shadow */}
      <ellipse cx="100" cy="210" rx="60" ry="8" fill="#10B981" fillOpacity="0.15" />

      {/* Body / White Lab Coat */}
      <path
        d="M58 135 C58 120, 75 110, 100 110 C125 110, 142 120, 142 135 L148 200 C148 205, 143 208, 138 208 L62 208 C57 208, 52 205, 52 200 Z"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Teal Scrubs Shirt */}
      <path
        d="M86 112 L100 135 L114 112 Z"
        fill="#0D9488"
      />

      {/* Lab Coat Lapels */}
      <path
        d="M74 112 L88 152 L62 148 Z"
        fill="#F8FAFC"
        stroke="#94A3B8"
        strokeWidth="2.5"
      />
      <path
        d="M126 112 L112 152 L138 148 Z"
        fill="#F8FAFC"
        stroke="#94A3B8"
        strokeWidth="2.5"
      />

      {/* Stethoscope around neck */}
      <path
        d="M78 122 C78 155, 122 155, 122 122"
        stroke="#0284C7"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Stethoscope bell */}
      <circle cx="100" cy="156" r="6.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />

      {/* Badge on Coat */}
      <rect x="66" y="156" width="14" height="18" rx="3" fill="#10B981" />
      <line x1="69" y1="162" x2="77" y2="162" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="69" y1="166" x2="74" y2="166" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

      {/* Left Arm Holding Clipboard */}
      <path
        d="M58 135 L42 165 C40 168, 43 174, 48 174 L60 170"
        stroke="#FFFFFF"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Clipboard */}
      <g transform="translate(32, 150) rotate(-10)">
        <rect x="0" y="0" width="22" height="30" rx="3" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
        <rect x="5" y="-3" width="12" height="5" rx="2" fill="#78350F" />
        <rect x="4" y="6" width="14" height="20" rx="1" fill="#FFFFFF" />
        <line x1="7" y1="11" x2="15" y2="11" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="15" x2="15" y2="15" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="19" x2="13" y2="19" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Right Arm Waving Cheerfully */}
      <g>
        <path
          d="M142 135 L160 115 C164 110, 172 114, 170 120 L158 145"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hand */}
        <circle cx="166" cy="112" r="8" fill="#FCD34D" />
        <circle cx="172" cy="108" r="3.5" fill="#FCD34D" />
      </g>

      {/* Neck */}
      <rect x="91" y="96" width="18" height="16" rx="4" fill="#FCD34D" />

      {/* Head */}
      <circle cx="100" cy="74" r="34" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />

      {/* Friendly Hair (Doctor's neat dark hair) */}
      <path
        d="M68 68 C68 44, 82 36, 100 36 C118 36, 132 44, 132 68 C132 72, 126 62, 120 60 C110 56, 106 58, 98 56 C88 54, 80 62, 68 68 Z"
        fill="#1E293B"
      />
      {/* Hair sideburns */}
      <path d="M68 68 L68 76 C68 80, 65 80, 65 74 Z" fill="#1E293B" />
      <path d="M132 68 L132 76 C132 80, 135 80, 135 74 Z" fill="#1E293B" />

      {/* Ears */}
      <circle cx="67" cy="76" r="6" fill="#FCD34D" />
      <circle cx="133" cy="76" r="6" fill="#FCD34D" />

      {/* Glasses (Modern round green frames) */}
      <circle cx="87" cy="74" r="10.5" fill="#FFFFFF" fillOpacity="0.8" stroke="#059669" strokeWidth="2.5" />
      <circle cx="113" cy="74" r="10.5" fill="#FFFFFF" fillOpacity="0.8" stroke="#059669" strokeWidth="2.5" />
      <line x1="97.5" y1="74" x2="102.5" y2="74" stroke="#059669" strokeWidth="2.5" />
      <line x1="72" y1="72" x2="76.5" y2="73" stroke="#059669" strokeWidth="2" />
      <line x1="123.5" y1="73" x2="128" y2="72" stroke="#059669" strokeWidth="2" />

      {/* Happy Eyes */}
      <circle cx="87" cy="74" r="3.5" fill="#0F172A" />
      <circle cx="113" cy="74" r="3.5" fill="#0F172A" />
      {/* Eye shine highlights */}
      <circle cx="85.5" cy="72.5" r="1.2" fill="#FFFFFF" />
      <circle cx="111.5" cy="72.5" r="1.2" fill="#FFFFFF" />

      {/* Eyebrows */}
      <path d="M80 60 Q87 56 94 61" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M106 61 Q113 56 120 60" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Rosy Cheeks */}
      <circle cx="77" cy="83" r="5" fill="#F87171" fillOpacity="0.45" />
      <circle cx="123" cy="83" r="5" fill="#F87171" fillOpacity="0.45" />

      {/* Smiling Mouth */}
      <path
        d="M93 84 Q100 93 107 84"
        stroke="#991B1B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="#EF4444"
      />

      {/* Medical Cross Headband or Cap Badge */}
      <circle cx="100" cy="46" r="8" fill="#10B981" />
      <rect x="98.5" y="41" width="3" height="10" rx="1" fill="#FFFFFF" />
      <rect x="95" y="44.5" width="10" height="3" rx="1" fill="#FFFFFF" />
    </svg>
  );
};

// 2. PIP THE PILL - Cute 2D Mascot Capsule with shoes & thumbs up
export const PipThePill = ({ className = "w-36 h-36" }) => {
  return (
    <svg
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pip the Pill Mascot"
    >
      {/* Floor Shadow */}
      <ellipse cx="80" cy="170" rx="42" ry="6" fill="#10B981" fillOpacity="0.2" />

      {/* Cute Little Sneakers */}
      <g>
        <ellipse cx="62" cy="162" rx="12" ry="7" fill="#0284C7" />
        <rect x="52" y="164" width="20" height="4" rx="2" fill="#FFFFFF" />
      </g>
      <g>
        <ellipse cx="98" cy="162" rx="12" ry="7" fill="#0284C7" />
        <rect x="88" y="164" width="20" height="4" rx="2" fill="#FFFFFF" />
      </g>

      {/* Little Legs */}
      <line x1="64" y1="135" x2="62" y2="158" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
      <line x1="96" y1="135" x2="98" y2="158" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

      {/* Left Arm: Thumbs up */}
      <path
        d="M48 95 C32 95, 26 80, 24 74"
        stroke="#10B981"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="23" cy="71" r="7" fill="#FBBF24" />
      <path d="M22 65 L22 58" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" />

      {/* Right Arm waving */}
      <path
        d="M112 95 C128 95, 136 82, 140 70"
        stroke="#34D399"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="141" cy="68" r="7" fill="#FBBF24" />

      {/* Main Pill Capsule Body */}
      {/* Lower Half: Crisp White with cute belt */}
      <path
        d="M48 85 L48 108 C48 126, 62 140, 80 140 C98 140, 112 126, 112 108 L112 85 Z"
        fill="#FFFFFF"
        stroke="#059669"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Upper Half: Vibrant Emerald Green */}
      <path
        d="M48 85 L48 56 C48 38, 62 24, 80 24 C98 24, 112 38, 112 56 L112 85 Z"
        fill="#10B981"
        stroke="#059669"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Pill Divider Stripe */}
      <line x1="48" y1="85" x2="112" y2="85" stroke="#047857" strokeWidth="3" />

      {/* Glossy Reflection Highlight */}
      <path
        d="M58 36 C64 30, 72 28, 80 28"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Big Cute Expressive Eyes */}
      <ellipse cx="68" cy="68" rx="6.5" ry="8.5" fill="#0F172A" />
      <ellipse cx="92" cy="68" rx="6.5" ry="8.5" fill="#0F172A" />
      {/* Catchlight sparkles */}
      <circle cx="66" cy="65" r="2.5" fill="#FFFFFF" />
      <circle cx="70" cy="71" r="1.2" fill="#FFFFFF" />
      <circle cx="90" cy="65" r="2.5" fill="#FFFFFF" />
      <circle cx="94" cy="71" r="1.2" fill="#FFFFFF" />

      {/* Cute Blush */}
      <ellipse cx="58" cy="76" rx="4.5" ry="2.5" fill="#F43F5E" fillOpacity="0.5" />
      <ellipse cx="102" cy="76" rx="4.5" ry="2.5" fill="#F43F5E" fillOpacity="0.5" />

      {/* Big Cheerful Smile */}
      <path
        d="M72 76 Q80 86 88 76"
        stroke="#0F172A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="#EF4444"
      />

      {/* Verification Shield Emblem on Lower Half */}
      <g transform="translate(73, 98) scale(0.7)">
        <path
          d="M10 2 L2 6 L2 14 C2 19, 6 23, 10 25 C14 23, 18 19, 18 14 L18 6 Z"
          fill="#10B981"
          stroke="#047857"
          strokeWidth="2"
        />
        <path d="M6 13 L9 16 L15 9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
};

// 3. ECO SPROUT - Cute little 2D Leaf & Recycler Companion
export const EcoSprout = ({ className = "w-24 h-24" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Eco Sprout Mascot"
    >
      {/* Shadow */}
      <ellipse cx="50" cy="92" rx="26" ry="4" fill="#059669" fillOpacity="0.15" />

      {/* Pot / Capsule Cup */}
      <path
        d="M32 60 L36 86 C36 89, 42 91, 50 91 C58 91, 64 89, 64 86 L68 60 Z"
        fill="#0284C7"
        stroke="#0369A1"
        strokeWidth="2.5"
      />
      <rect x="30" y="56" width="40" height="7" rx="3.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />

      {/* Pot Face */}
      <circle cx="44" cy="74" r="2" fill="#0F172A" />
      <circle cx="56" cy="74" r="2" fill="#0F172A" />
      <path d="M47 79 Q50 83 53 79" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="39" cy="76" r="2" fill="#F43F5E" fillOpacity="0.4" />
      <circle cx="61" cy="76" r="2" fill="#F43F5E" fillOpacity="0.4" />

      {/* Stem */}
      <path d="M50 56 Q50 38 46 28" stroke="#10B981" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Left Leaf */}
      <path
        d="M48 42 C30 42, 24 30, 26 22 C34 22, 46 32, 48 42 Z"
        fill="#34D399"
        stroke="#059669"
        strokeWidth="2"
      />
      <path d="M28 24 Q38 32 46 40" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Right Leaf */}
      <path
        d="M47 34 C64 30, 72 18, 70 10 C60 12, 50 24, 47 34 Z"
        fill="#10B981"
        stroke="#047857"
        strokeWidth="2"
      />
      <path d="M68 12 Q58 22 49 32" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Sparkle */}
      <path d="M76 28 L78 33 L83 35 L78 37 L76 42 L74 37 L69 35 L74 33 Z" fill="#FBBF24" />
    </svg>
  );
};

// 4. ADMIN COMMANDER - Distinctive 2D Platform Administrator Mascot with Golden Crown, Executive Blazer & Command Tablet
export const AdminCommander = ({ className = "w-48 h-48" }) => {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MediCycle Admin Commander mascot"
    >
      {/* Soft Ambient Floor Shadow */}
      <ellipse cx="100" cy="210" rx="60" ry="8" fill="#0D9488" fillOpacity="0.2" />

      {/* Body / Executive Navy-Teal Blazer */}
      <path
        d="M58 135 C58 120, 75 110, 100 110 C125 110, 142 120, 142 135 L148 200 C148 205, 143 208, 138 208 L62 208 C57 208, 52 205, 52 200 Z"
        fill="#0F2E2C"
        stroke="#115E59"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Crisp White Shirt Collar */}
      <path
        d="M84 112 L100 148 L116 112 Z"
        fill="#FFFFFF"
      />

      {/* Executive Emerald Silk Tie */}
      <path
        d="M96 118 L104 118 L106 142 L100 152 L94 142 Z"
        fill="#10B981"
        stroke="#047857"
        strokeWidth="1.5"
      />
      {/* Tie Knot */}
      <polygon points="95,116 105,116 103,123 97,123" fill="#059669" />

      {/* Blazer Lapels */}
      <path
        d="M74 112 L86 156 L62 148 Z"
        fill="#134E4A"
        stroke="#0F766E"
        strokeWidth="2.5"
      />
      <path
        d="M126 112 L114 156 L138 148 Z"
        fill="#134E4A"
        stroke="#0F766E"
        strokeWidth="2.5"
      />

      {/* Admin Gold Lanyard strap */}
      <path
        d="M80 120 C80 148, 120 148, 120 120"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Security ID Badge */}
      <g transform="translate(90, 144)">
        <rect x="0" y="0" width="20" height="25" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <rect x="0" y="0" width="20" height="6" rx="2" fill="#0D9488" />
        {/* Photo avatar on badge */}
        <rect x="3" y="9" width="6" height="7" rx="1" fill="#FDE68A" />
        {/* Badge lines */}
        <line x1="11" y1="11" x2="17" y2="11" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="11" y1="14" x2="16" y2="14" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
        <text x="10" y="21" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#0D9488" fontFamily="sans-serif">ADMIN</text>
      </g>

      {/* Left Arm Holding Digital Command Tablet */}
      <path
        d="M58 135 L40 166 C38 170, 42 176, 48 175 L58 170"
        stroke="#0F2E2C"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sleek Command Tablet */}
      <g transform="translate(28, 150) rotate(-12)">
        <rect x="0" y="0" width="25" height="34" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <rect x="2" y="2" width="21" height="30" rx="2" fill="#0F172A" />
        <rect x="4" y="4" width="17" height="3" rx="1" fill="#0284C7" />
        {/* Bar charts */}
        <rect x="5" y="11" width="3" height="7" rx="1" fill="#10B981" />
        <rect x="9" y="9" width="3" height="9" rx="1" fill="#38BDF8" />
        <rect x="13" y="13" width="3" height="5" rx="1" fill="#F59E0B" />
        <rect x="17" y="8" width="3" height="10" rx="1" fill="#10B981" />
        {/* Status checkmark */}
        <circle cx="8" cy="24" r="3" fill="#10B981" />
        <path d="M6.5 24 L7.5 25 L9.5 23" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="13" y1="24" x2="19" y2="24" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Right Arm Waving Cheerfully */}
      <g>
        <path
          d="M142 135 L162 112 C166 107, 174 112, 172 118 L158 145"
          stroke="#0F2E2C"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hand */}
        <circle cx="168" cy="110" r="8" fill="#FCD34D" />
        <circle cx="174" cy="106" r="3.5" fill="#FCD34D" />
      </g>

      {/* Neck */}
      <rect x="91" y="96" width="18" height="16" rx="4" fill="#FCD34D" />

      {/* Head */}
      <circle cx="100" cy="74" r="34" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />

      {/* Modern Executive Hairstyle */}
      <path
        d="M66 68 C66 42, 80 34, 100 34 C120 34, 134 42, 134 68 C134 72, 126 60, 118 56 C108 52, 96 53, 86 56 C76 59, 70 63, 66 68 Z"
        fill="#1E293B"
      />
      <path
        d="M82 43 Q96 38 114 42"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M68 66 L68 76 C68 80, 65 80, 65 74 Z" fill="#1E293B" />
      <path d="M132 66 L132 76 C132 80, 135 80, 135 74 Z" fill="#1E293B" />

      {/* Ears */}
      <circle cx="67" cy="76" r="6" fill="#FCD34D" />
      <circle cx="133" cy="76" r="6" fill="#FCD34D" />

      {/* Smart Wireless Headset */}
      <path d="M66 74 C62 74, 62 82, 66 82" stroke="#0D9488" strokeWidth="3" fill="none" />
      <path d="M64 78 Q66 88 78 88" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="79" cy="88" r="3" fill="#14B8A6" />

      {/* Sleek Modern Eyewear */}
      <rect x="76" y="66" width="20" height="15" rx="4" fill="#FFFFFF" fillOpacity="0.85" stroke="#0F766E" strokeWidth="2.5" />
      <rect x="104" y="66" width="20" height="15" rx="4" fill="#FFFFFF" fillOpacity="0.85" stroke="#0F766E" strokeWidth="2.5" />
      <line x1="96" y1="73" x2="104" y2="73" stroke="#0F766E" strokeWidth="2.5" />
      <line x1="68" y1="71" x2="76" y2="72" stroke="#0F766E" strokeWidth="2" />
      <line x1="124" y1="72" x2="132" y2="71" stroke="#0F766E" strokeWidth="2" />

      {/* Confident, Friendly Eyes */}
      <circle cx="86" cy="73.5" r="3.5" fill="#0F172A" />
      <circle cx="114" cy="73.5" r="3.5" fill="#0F172A" />
      <circle cx="84.5" cy="72" r="1.2" fill="#FFFFFF" />
      <circle cx="112.5" cy="72" r="1.2" fill="#FFFFFF" />

      {/* Eyebrows */}
      <path d="M78 61 Q85 58 92 62" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M108 62 Q115 58 122 61" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Rosy Cheeks */}
      <circle cx="76" cy="84" r="5" fill="#F87171" fillOpacity="0.45" />
      <circle cx="124" cy="84" r="5" fill="#F87171" fillOpacity="0.45" />

      {/* Cheerful Confident Smile */}
      <path
        d="M93 84 Q100 93 107 84"
        stroke="#991B1B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="#EF4444"
      />
    </svg>
  );
};

export default DoctorMedi;
