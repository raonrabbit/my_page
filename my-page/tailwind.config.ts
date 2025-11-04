import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./common/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["var(--font-pretendard)"],
      },
      animation: {
        "fade-out-down": "fadeOutDown 1s ease-in-out 1s forwards",
      },
      keyframes: {
        fadeOutDown: {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(50px)",
          },
        },
      },
    },
  },
};

export default config;
