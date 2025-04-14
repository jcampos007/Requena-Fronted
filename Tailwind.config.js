/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html" // Agregar esta línea asegura que Tailwind detecte todas las clases en HTML
    ],
    
    theme: {
        extend: {
            colors: {
                'requena-red': '#dc2626', // Color rojo de Requena
            },
        },
    },
    plugins: [],
};