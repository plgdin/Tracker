/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Warm Artisan Bakery Palette (Reference Theme)
        cocoa: "#4A2818",
        "cocoa-dark": "#361B0E",
        "cocoa-light": "#673D26",
        "cocoa-muted": "#7A6153",
        cream: "#F9F4EE",
        "cream-light": "#FCFAF7",
        "cream-sand": "#F2E7DC",
        blush: "#EAD9CF",
        terracotta: "#C87D55",

        // Palette aliases
        wasabi: "#EAF05C",
        topaze: "#4A2818",
        "orange-topaze": "#4A2818",
        "cool-blue": "#F2E7DC",
        cassis: "#4A2818",
        sauge: "#8A9A86",
        "vert-sauge": "#8A9A86",
        "warm-white": "#F9F4EE",
        "espresso": "#361B0E",
        "burnt-orange": "#4A2818",
        taupe: "#7A6153",
        "dark-chocolate": "#361B0E",
      },
      fontFamily: {
        serif: ["'DM Serif Display'", "'Playfair Display'", 'Georgia', 'serif'],
        display: ["'DM Serif Display'", "'Playfair Display'", 'serif'],
        script: ["'Alex Brush'", 'cursive', 'serif'],
        sans: ["'Plus Jakarta Sans'", "'Outfit'", 'sans-serif'],
        body: ["'Plus Jakarta Sans'", "'Outfit'", 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}