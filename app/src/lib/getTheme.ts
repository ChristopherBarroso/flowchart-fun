import { StylesheetStyle } from "cytoscape";

import { getDoc } from "./docHelpers";

/**
 * Get the user style from the document metadata.
 */
export function getUserStyle() {
  return (getDoc().meta?.style ?? []) as StylesheetStyle[];
}

// const theme = useGraphTheme(options.graphOptions.theme);
// That's how we're currently grabbing the theme from the name
// Believe it does some async loading behind the scenes
