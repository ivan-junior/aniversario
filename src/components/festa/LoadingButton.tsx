import type { ButtonHTMLAttributes, ReactNode } from 'react'

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  loadingText?: string
  children: ReactNode
  variant?: 'gold' | 'ghost' | 'danger'
}

const variantClass: Record<NonNullable<LoadingButtonProps['variant']>, string> =
  {
    gold: 'btn-gold',
    ghost:
      'border border-white/15 bg-white/5 text-cream hover:bg-white/10 disabled:opacity-55',
    danger:
      'border border-rose-400/40 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25 disabled:opacity-55',
  }

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  variant = 'gold',
  className = '',
  disabled,
  type = 'button',
  ...props
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-base tracking-wide transition disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
      {...props}
    >
      {loading ? loadingText || 'Aguarde...' : children}
    </button>
  )
}
