/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        kanit:["Kanit","serif"],
        "bai-jamjuree":["Bai Jamjuree","serif"],
        merriweather: ["Merriweather", "serif"],
        "monsieur-la-doulaise": ['"Monsieur La Doulaise"', "cursive"],
        montserrat: ["Montserrat", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
      },
    },
  },
  safelist: [
    "grid-cols-12","grid-cols-8","grid-cols-4","border-t-0","border-l-0","border-r-0","border-b-0",
    "col-span-12","col-span-11","col-span-10","col-span-9","col-span-8","col-span-7",
    "col-span-6","col-span-5","col-span-4","col-span-3","col-span-2","col-span-1",
    "pt-[0px]","pt-[50px]","pt-[100px]","pb-[0px]","pb-[50px]","pb-[100px]",
    "font-merriweather","font-monsieur-la-doulaise","font-montserrat","font-oswald","font-raleway",
  ],
  plugins: [],
};


