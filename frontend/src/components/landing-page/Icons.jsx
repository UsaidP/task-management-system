import * as FeatherIcons from "react-icons/fi";

/**
 * A dynamic icon component that renders a Feather Icon based on a string name.
 * This prevents having to import every single icon into our main page.
 *
 * @param {object} props
 * @param {keyof typeof FeatherIcons} props.name - The name of the Feather Icon to render (e.g., "FiTrello").
 */
export const Icon = ({ name, ...props }) => {
	const FeatherIcon = FeatherIcons[name];

	// If the icon name is invalid, render a fallback icon to indicate an error.
	if (!FeatherIcon) {
		console.warn(`Icon "${name}" not found. Rendering a fallback.`);
		return <FeatherIcons.FiAlertCircle {...props} />;
	}

	return <FeatherIcon {...props} />;
};
