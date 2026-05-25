// CTF Timetable thema — kleuren, spacing, typografie.
// Gebruik dit bestand overal i.p.v. hex-codes uit te schrijven.

export const colors = {
    // CTF brand colors
    primary: '#1a5b64',        // diep teal, hoofdknop kleur
    primaryHover: '#2e9aaa',   // lichter teal, accent
    secondary: '#20747f',      // medium teal, kaart-titels en knoppen
    accent: '#78b5e3',         // lichtblauw, navigatie

    // Backgrounds
    appBackground: '#1a5b64',  // app achtergrond
    cardBackground: '#ffffff', // kaarten

    // Text
    textPrimary: '#1f2937',    // donker grijs
    textSecondary: '#6b7280',  // medium grijs
    textOnDark: '#ffffff',
    textMuted: '#9ca3af',

    // Status
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',

    // Crowd levels
    crowdGreen: '#16a34a',
    crowdOrange: '#f59e0b',
    crowdRed: '#dc2626',

    // Overlay / glass
    overlay: 'rgba(0, 0, 0, 0.5)',
    glassLight: 'rgba(255, 255, 255, 0.3)',
    glassDark: 'rgba(0, 0, 0, 0.2)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const radii = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
};

export const fontSizes = {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
};

export const fonts = {
    regular: 'Oswald_400Regular',
    semibold: 'Oswald_600SemiBold',
    bold: 'Oswald_700Bold',
};

export const shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHover: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
};
