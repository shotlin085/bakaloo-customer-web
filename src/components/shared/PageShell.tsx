import { cn } from '@/lib/utils'

interface PageShellProps {
  children: React.ReactNode
  className?: string
  spacing?: 'compact' | 'default' | 'relaxed'
}

const SPACING_MAP = {
  compact: 'space-y-5',
  default: 'space-y-6',
  relaxed: 'space-y-8',
}

export function PageShell({
  children,
  className,
  spacing = 'default',
}: PageShellProps) {
  return (
    <div
      className={cn(
        'page-enter px-4 py-5 sm:px-5 lg:px-6 lg:py-6',
        SPACING_MAP[spacing],
        className,
      )}
    >
      {children}
    </div>
  )
}
