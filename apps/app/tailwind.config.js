import ChessTheme from "@chess/theme";

/** @type {typeof ChessTheme} */
export default {
  content: [
    "./src/**/*.jsx",
    "./src/**/*.tsx",
    ...ChessTheme.content,
  ],
  presets: [ChessTheme],
}
