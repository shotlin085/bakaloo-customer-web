import type { Config } from 'tailwindcss'

const config: Config = {
	darkMode: ['class'],
	content: ['./src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				brand: {
					50: '#F0FDF4',
					100: '#DCFCE7',
					200: '#BBF7D0',
					500: '#22C55E',
					600: '#16A34A',
					700: '#15803D',
					800: '#166534',
					900: '#14532D',
				},
				page: '#F0EDE8',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			fontFamily: {
				sans: ['DM Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			animation: {
				'slide-up': 'slideUp 0.3s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
				'fade-in': 'fadeIn 0.2s ease-out',
				shimmer: 'shimmer 1.5s infinite',
				'badge-bounce': 'badgeBounce 0.3s ease-out',
			},
			keyframes: {
				slideUp: {
					from: { opacity: '0', transform: 'translateY(12px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				slideDown: {
					from: { opacity: '0', transform: 'translateY(-8px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				shimmer: {
					from: { backgroundPosition: '-400px 0' },
					to: { backgroundPosition: '400px 0' },
				},
				badgeBounce: {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.3)' },
					'100%': { transform: 'scale(1)' },
				},
			},
		},
	},
	plugins: [
		require('tailwindcss-animate'),
		require('@tailwindcss/typography'),
	],
}

export default config
