type PageHeaderProps = {
  title: string
  description?: string
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-forest sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 text-lg text-ink/75">{description}</p>}
    </div>
  )
}
