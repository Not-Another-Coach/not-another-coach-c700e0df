import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					50: 'hsl(var(--primary-50))',
					100: 'hsl(var(--primary-100))',
					200: 'hsl(var(--primary-200))',
					300: 'hsl(var(--primary-300))',
					400: 'hsl(var(--primary-400))',
					500: 'hsl(var(--primary-500))',
					600: 'hsl(var(--primary-600))',
					700: 'hsl(var(--primary-700))',
					800: 'hsl(var(--primary-800))',
					900: 'hsl(var(--primary-900))'
				},
				
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					50: 'hsl(var(--secondary-50))',
					100: 'hsl(var(--secondary-100))',
					200: 'hsl(var(--secondary-200))',
					300: 'hsl(var(--secondary-300))',
					400: 'hsl(var(--secondary-400))',
					500: 'hsl(var(--secondary-500))',
					600: 'hsl(var(--secondary-600))',
					700: 'hsl(var(--secondary-700))',
					800: 'hsl(var(--secondary-800))',
					900: 'hsl(var(--secondary-900))'
				},
				
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					50: 'hsl(var(--accent-50))',
					100: 'hsl(var(--accent-100))',
					200: 'hsl(var(--accent-200))',
					300: 'hsl(var(--accent-300))',
					400: 'hsl(var(--accent-400))',
					500: 'hsl(var(--accent-500))',
					600: 'hsl(var(--accent-600))',
					700: 'hsl(var(--accent-700))',
					800: 'hsl(var(--accent-800))',
					900: 'hsl(var(--accent-900))'
				},
				
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					50: 'hsl(var(--success-50))',
					100: 'hsl(var(--success-100))',
					200: 'hsl(var(--success-200))',
					300: 'hsl(var(--success-300))',
					400: 'hsl(var(--success-400))',
					500: 'hsl(var(--success-500))',
					600: 'hsl(var(--success-600))',
					700: 'hsl(var(--success-700))',
					800: 'hsl(var(--success-800))',
					900: 'hsl(var(--success-900))'
				},
				
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					50: 'hsl(var(--warning-50))',
					100: 'hsl(var(--warning-100))',
					200: 'hsl(var(--warning-200))',
					300: 'hsl(var(--warning-300))',
					400: 'hsl(var(--warning-400))',
					500: 'hsl(var(--warning-500))',
					600: 'hsl(var(--warning-600))',
					700: 'hsl(var(--warning-700))',
					800: 'hsl(var(--warning-800))',
					900: 'hsl(var(--warning-900))'
				},
				
				error: {
					DEFAULT: 'hsl(var(--error))',
					foreground: 'hsl(var(--error-foreground))',
					50: 'hsl(var(--error-50))',
					100: 'hsl(var(--error-100))',
					200: 'hsl(var(--error-200))',
					300: 'hsl(var(--error-300))',
					400: 'hsl(var(--error-400))',
					500: 'hsl(var(--error-500))',
					600: 'hsl(var(--error-600))',
					700: 'hsl(var(--error-700))',
					800: 'hsl(var(--error-800))',
					900: 'hsl(var(--error-900))'
				},
				
				energy: {
					DEFAULT: 'hsl(var(--energy))',
					foreground: 'hsl(var(--energy-foreground))',
					50: 'hsl(var(--energy-50))',
					100: 'hsl(var(--energy-100))',
					200: 'hsl(var(--energy-200))',
					300: 'hsl(var(--energy-300))',
					400: 'hsl(var(--energy-400))',
					500: 'hsl(var(--energy-500))',
					600: 'hsl(var(--energy-600))',
					700: 'hsl(var(--energy-700))',
					800: 'hsl(var(--energy-800))',
					900: 'hsl(var(--energy-900))'
				},
				
				purple: {
					DEFAULT: 'hsl(var(--purple))',
					foreground: 'hsl(var(--purple-foreground))',
					50: 'hsl(var(--purple-50))',
					100: 'hsl(var(--purple-100))',
					200: 'hsl(var(--purple-200))',
					300: 'hsl(var(--purple-300))',
					400: 'hsl(var(--purple-400))',
					500: 'hsl(var(--purple-500))',
					600: 'hsl(var(--purple-600))',
					700: 'hsl(var(--purple-700))',
					800: 'hsl(var(--purple-800))',
					900: 'hsl(var(--purple-900))'
				},
				
				indigo: {
					DEFAULT: 'hsl(var(--indigo))',
					foreground: 'hsl(var(--indigo-foreground))',
					50: 'hsl(var(--indigo-50))',
					100: 'hsl(var(--indigo-100))',
					200: 'hsl(var(--indigo-200))',
					300: 'hsl(var(--indigo-300))',
					400: 'hsl(var(--indigo-400))',
					500: 'hsl(var(--indigo-500))',
					600: 'hsl(var(--indigo-600))',
					700: 'hsl(var(--indigo-700))',
					800: 'hsl(var(--indigo-800))',
					900: 'hsl(var(--indigo-900))'
				},
				
				gray: {
					50: 'hsl(var(--gray-50))',
					100: 'hsl(var(--gray-100))',
					200: 'hsl(var(--gray-200))',
					300: 'hsl(var(--gray-300))',
					400: 'hsl(var(--gray-400))',
					500: 'hsl(var(--gray-500))',
					600: 'hsl(var(--gray-600))',
					700: 'hsl(var(--gray-700))',
					800: 'hsl(var(--gray-800))',
					900: 'hsl(var(--gray-900))'
				},
				
				// Legacy compatibility
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			
			spacing: {
				'xs': 'var(--spacing-xs)',
				'sm': 'var(--spacing-sm)',
				'md': 'var(--spacing-md)',
				'lg': 'var(--spacing-lg)',
				'xl': 'var(--spacing-xl)',
				'2xl': 'var(--spacing-2xl)',
				'3xl': 'var(--spacing-3xl)',
				'4xl': 'var(--spacing-4xl)',
				'5xl': 'var(--spacing-5xl)'
			},
			
			fontSize: {
				'xs': ['var(--text-xs)', { lineHeight: 'var(--leading-tight)' }],
				'sm': ['var(--text-sm)', { lineHeight: 'var(--leading-normal)' }],
				'base': ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
				'lg': ['var(--text-lg)', { lineHeight: 'var(--leading-normal)' }],
				'xl': ['var(--text-xl)', { lineHeight: 'var(--leading-snug)' }],
				'2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-snug)' }],
				'3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
				'4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
				'5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-none)' }],
				'6xl': ['var(--text-6xl)', { lineHeight: 'var(--leading-none)' }],
				'7xl': ['var(--text-7xl)', { lineHeight: 'var(--leading-none)' }],
				'8xl': ['var(--text-8xl)', { lineHeight: 'var(--leading-none)' }],
				'9xl': ['var(--text-9xl)', { lineHeight: 'var(--leading-none)' }]
			},
			
			lineHeight: {
				'none': 'var(--leading-none)',
				'tight': 'var(--leading-tight)',
				'snug': 'var(--leading-snug)',
				'normal': 'var(--leading-normal)',
				'relaxed': 'var(--leading-relaxed)',
				'loose': 'var(--leading-loose)'
			},
			
			fontWeight: {
				'thin': 'var(--font-thin)',
				'extralight': 'var(--font-extralight)',
				'light': 'var(--font-light)',
				'normal': 'var(--font-normal)',
				'medium': 'var(--font-medium)',
				'semibold': 'var(--font-semibold)',
				'bold': 'var(--font-bold)',
				'extrabold': 'var(--font-extrabold)',
				'black': 'var(--font-black)'
			},
			
			borderRadius: {
				'xs': 'var(--radius-xs)',
				'sm': 'var(--radius-sm)',
				'md': 'var(--radius-md)',
				'lg': 'var(--radius-lg)',
				'xl': 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
				'3xl': 'var(--radius-3xl)',
				'full': 'var(--radius-full)',
				// Legacy compatibility
				DEFAULT: 'var(--radius)'
			},
			
			boxShadow: {
				'xs': 'var(--shadow-xs)',
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'2xl': 'var(--shadow-2xl)',
				'primary': 'var(--shadow-primary)',
				'secondary': 'var(--shadow-secondary)',
				'accent': 'var(--shadow-accent)',
				'success': 'var(--shadow-success)',
				'warning': 'var(--shadow-warning)',
				'error': 'var(--shadow-error)',
				// Legacy compatibility
				'card': 'var(--shadow-card)',
				'hero': 'var(--shadow-hero)',
				'button': 'var(--shadow-button)'
			},
			
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-primary-soft': 'var(--gradient-primary-soft)',
        'gradient-energy': 'var(--gradient-energy)',
        'gradient-energy-soft': 'var(--gradient-energy-soft)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-glass': 'var(--gradient-glass)',
        'gradient-ai': 'var(--gradient-ai)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out'
      }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
