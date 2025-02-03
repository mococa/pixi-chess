import { dirname, join } from "path";
import { Config } from "tailwindcss";

/**
 * @description
 * List of workspaces to include content of. No need for
 * any apps, here. only packages
 *
 * @example "@chess/ui"
 */
const workspaces: string[] = [];
const content = workspaces.map((workspace) => join(dirname(require.resolve(workspace)), "./**/*.tsx"));

module.exports = {
  content,
  theme: {
    extend: {},
    fontFamily: {
      roboto: ["Roboto", "sans-serif"],
      "crete-round": ["Crete Round", "sans-serif"],
    },
  },
  plugins: [],
} as Config;
