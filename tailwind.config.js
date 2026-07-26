/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 실제 UI는 전부 아래의 시맨틱 토큰(surface/ink/accent 등, index.css의 CSS 변수를
        // 가리킴)을 통해서만 색을 쓴다. 참고 색상 램프는 Tailwind 기본 neutral-* 스케일을
        // 그대로 쓰며(별도 커스텀 램프 없음), index.css의 hex 값들도 그 스케일에서 골랐다.
        // 브랜드 컬러를 다시 바꿀 때는 index.css 상단 주석의 체크리스트를 따라가면 된다.
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        'surface-sunken': 'var(--color-surface-sunken)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        'ink-faint': 'var(--color-ink-faint)',
        line: 'var(--color-line)',
        'line-input': 'var(--color-line-input)',
        accent: 'var(--color-accent)',
        'accent-strong': 'var(--color-accent-strong)',
        'accent-soft': 'var(--color-accent-soft)',
        'accent-on': 'var(--color-accent-on)',
        highlight: 'var(--color-highlight)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        'danger-soft': 'var(--color-danger-soft)',
        warning: 'var(--color-warning)',
        'warning-soft': 'var(--color-warning-soft)',
        disabled: 'var(--color-disabled-bg)',
        'disabled-ink': 'var(--color-disabled-ink)',
        focus: 'var(--color-focus-ring)',
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Apple SD Gothic Neo"',
          '"Malgun Gothic"',
          'sans-serif',
        ],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out',
        'pop-in': 'pop-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
