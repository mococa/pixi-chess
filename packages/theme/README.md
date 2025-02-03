# @chess/theme

This is the theme workspace for the chess project. It contains the necessary code to style the chess game.

For all apps, it is a shared piece of code for everything. This just keeps things the same across all the
apps.

If a future package needs to be styled, such as `"@chess/ui"` for example that would contains all the buttons
and shiny components, it would need to be aware of its contents on the `workspaces` array in the
`tailwind.config.ts` file.
