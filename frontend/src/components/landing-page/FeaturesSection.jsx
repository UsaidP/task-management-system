import { Icon } from "./Icons"
import { featureData } from "./landingPageComponent.js"

export const FeaturesSection = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-8 max-w-6xl mx-auto">
      {featureData.map((feature) => (
        <div
          key={feature.title}
          className="p-6 bg-bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col items-start gap-3 hover:scale-[1.02] transition-transform duration-fast"
        >
          <div className="p-3 rounded-xl bg-accent-primary/10 text-primary">
            <Icon name={feature.icon} size={24} />
          </div>
          <h3 className="text-lg font-serif font-semibold text-text-primary">{feature.title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </section>
  )
}
