// src/constants/Colors.ts

// Solo Leveling Inspired Dark Fantasy Theme - Refined for new UI
const primaryBackgroundColor = '#0A0A0F'; // Very dark, almost black (as per new image)
const secondaryBackgroundColor = '#101018'; // Slightly lighter dark for cards/elements
const accentNeonBlue = '#00A3FF'; // Vibrant blue from new UI (e.g. SUNG JINWOO text)
const accentSecondaryBlue = '#40CFFF'; // Lighter blue for glows or highlights
const accentElectricViolet = '#7F00FF'; // Kept for potential secondary accents
const accentSteelGray = '#A0A7B0'; // For less prominent elements or borders

const textPrimary = '#F0F5FA'; // Primary text color (bright off-white)
const textSecondary = '#B0B8C0'; // Secondary text color (lighter gray for subtitles)
const placeholderText = '#707880'; // Placeholder text for inputs

const inputBackground = '#181820'; // Dark input background
const inputBorder = '#282830'; // Subtle border for inputs

const googleButtonBackground = '#FFFFFF';
const googleButtonText = '#121212';

// Specific UI elements from the new screenshot
const profileNameColor = accentNeonBlue;
const rankTextColor = '#C0C8D0'; // Slightly muted for rank text
const xpTextColor = '#808A94'; // For "4350/5000 XP to next level"
const xpBarColor = accentNeonBlue;
const statCardBackgroundColor = '#10121A'; // Darker, distinct card background
const statCardBorderColor = accentNeonBlue; // Glowing border for stat cards
const missionTitleHeaderColor = textPrimary; // "TODAY'S MISSIONS"
const missionXPColor = accentNeonBlue;
const missionCheckboxBorder = accentNeonBlue;
const generateWorkoutButtonBorder = accentNeonBlue; // Glowing border for the main button
const generateWorkoutButtonBackground = 'rgba(0, 163, 255, 0.1)'; // Subtle blue fill

export default {
  dark: {
    text: textPrimary,
    textSecondary: textSecondary,
    background: primaryBackgroundColor,
    secondaryBackground: secondaryBackgroundColor, // For general card backgrounds
    tint: accentNeonBlue,
    primary: accentNeonBlue,
    secondary: accentElectricViolet,
    tertiary: accentSteelGray,

    profileNameColor: profileNameColor,
    rankTextColor: rankTextColor,
    xpTextColor: xpTextColor,
    xpBarColor: xpBarColor,
    xpBarBackground: '#20222A', // Darker background for XP bar

    statCardBackground: statCardBackgroundColor,
    statCardBorder: statCardBorderColor,
    statCardIconColor: accentSecondaryBlue,
    statCardTitleColor: textSecondary,
    statCardValueColor: textPrimary,

    missionTitleHeader: missionTitleHeaderColor,
    missionIconColor: accentSecondaryBlue,
    missionTextColor: textPrimary,
    missionXPColor: missionXPColor,
    missionCheckboxBorder: missionCheckboxBorder,
    missionCheckboxCheckedColor: accentNeonBlue,

    inputBackground: inputBackground,
    inputBorder: inputBorder,
    placeholderText: placeholderText,

    googleButtonBackground: googleButtonBackground,
    googleButtonText: googleButtonText,
    orTextColor: textSecondary,
    linkTextColor: accentNeonBlue,

    bottomNavBackground: '#08080C',
    bottomNavActive: accentNeonBlue,
    bottomNavInactive: accentSteelGray,

    // Font placeholders (replace with actual font names after setup)
    // Header examples: 'Cinzel-Bold', 'PlayfairDisplay-Bold'
    // Body examples: 'Inter-Regular', 'SFProText-Regular'
    headerFont: 'serif', // For SUNG JINWOO, TODAY'S MISSIONS
    fantasyRankFont: 'serif', // Slightly different for Rank C - SHADOW HUNTER
    bodyFont: 'sans-serif', // For most other text
    statValueFont: 'sans-serif', // Potentially a bolder/condensed sans-serif for stat values

    generateWorkoutButtonBorder: generateWorkoutButtonBorder,
    generateWorkoutButtonBackground: generateWorkoutButtonBackground,
    secondaryActionButtonColor: accentSecondaryBlue, // For "Start Workout", "Claim Rewards"
  },
  light: { // Kept for completeness, but not the focus
    text: '#000',
    textSecondary: '#555',
    background: '#fff',
    // ... (other light theme properties)
    headerFont: 'serif',
    bodyFont: 'sans-serif',
  },
};
