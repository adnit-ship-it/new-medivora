/**
 * Utility function to get icon path from icon registry
 * @param iconType - The icon type key from iconRegistry
 * @param iconRegistry - The icon registry object from websiteText
 * @returns The icon path or fallback
 */
export function getIconPath(
  iconType: string | undefined,
  iconRegistry: Record<string, string> | undefined
): string {
  if (!iconType || !iconRegistry) {
    return '/assets/images/checkmark.svg'
  }
  return iconRegistry[iconType] || '/assets/images/checkmark.svg'
}

/**
 * Utility function to get SVG style object for applying colors
 * @param color - The color to apply (hex, rgb, or CSS variable)
 * @returns Style object with color property
 */
export function getSvgColorStyle(color: string | undefined): { color: string } | {} {
  if (!color) {
    return {}
  }
  return { color }
}


