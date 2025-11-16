import React from "react"
import { Icon } from "./Icon" // Adjust path as needed
import { featureData } from "./landingPageComponent.js" // Adjust path as needed

/**
 * A component that displays the list of features
 * by mapping over featureData and using the dynamic Icon component.
 */
export const FeaturesSection = () => {
  return (
    <section className="features-container">
      {featureData.map((feature) => (
        <div key={feature.title} className="feature-card">
          {/*
           * This is the fix:
           * We pass the 'feature.icon' string (e.g., "FiTrello")
           * to the 'name' prop of the <Icon> component.
           */}
          <Icon name={feature.icon} className="feature-icon" size={28} />

          <h3 className="feature-title">{feature.title}</h3>
          <p className="feature-description">{feature.description}</p>
        </div>
      ))}
    </section>
  )
}

// You would then import and use <FeaturesSection /> in your main page.
