// Shared class names so buttons and form controls look the same everywhere.

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-card hover:bg-brand-700 disabled:hover:bg-brand-600',
  secondary: 'border border-line-strong bg-surface text-ink shadow-card hover:border-brand-500 hover:bg-brand-50 disabled:hover:bg-surface',
  danger: 'border border-danger-200 bg-surface text-danger-700 shadow-card hover:border-danger-500 hover:bg-danger-50',
  ghost: 'text-brand-700 hover:bg-brand-50',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]}`
}

/** Text inputs, selects and textareas. */
export const inputClass =
  'block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink shadow-card transition-colors placeholder:text-muted/80 hover:border-muted/60 focus:border-brand-600 disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-70 aria-invalid:border-danger-500'

export const labelClass = 'block text-sm font-semibold text-ink'

export const fieldErrorClass = 'mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger-700'

/** Underlined text link inside sentences. */
export const textLinkClass = 'font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600'
