/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#008AD1',
                    dark: '#1A2B3C',
                    surface: '#F5F7FA',
                    border: '#D0E8F5',
                    success: '#22C55E',
                    danger: '#EF4444',
                    warning: '#F59E0B',
                    text: '#333333',
                    'text-secondary': '#777777',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Arial', 'sans-serif'],
            },
            width: {
                sidebar: '240px',
            },
            height: {
                topnav: '64px',
            },
            maxWidth: {
                content: '1400px',
            },
            spacing: {
                sidebar: '240px',
                topnav: '64px',
            },
        },
    },
    plugins: [],
};
