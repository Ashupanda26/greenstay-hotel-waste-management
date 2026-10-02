import Icon from '../ui/Icon'

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-5 text-sm text-muted sm:px-6 lg:px-8">
        <Icon name="leaf" className="size-4 text-brand-600" />
        GreenStay · Hotel waste management
      </div>
    </footer>
  )
}
