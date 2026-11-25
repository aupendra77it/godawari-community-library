import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { forest: "#14532d", leaf: "#16a34a", cream: "#f7f8f4" } } }, plugins: [] };
export default config;
