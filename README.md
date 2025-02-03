# Chess

A simple chess game written in TypeScript, using Pixi 8 for rendering, Pulumi for infrastructure, AWS for
hosting, and Nullstack for the app wrapper.

This is a monorepo with workspaces, therefore, there will be only one `node_modules` folder generated at the
root of the project (there is no need to run `npm install` in each workspace).

I used bun for the project package manager, so you can run `bun install` to install the dependencies.

![Image](https://github.com/user-attachments/assets/b7e4a24e-705d-4b45-b4ae-b7d32ed29121)

**Note**: The game is still in development, so there are some features missing, like:

- castling (core logic)
- en passant (core logic)
- promotion selection (ui. currently it is making a queen promotion automatically).

## Workspaces

- `@chess/app`: The chess game wrapper.
- `@chess/infrastructure`: The infrastructure workspace for the chess project. It contains the necessary code
  to automatically host and deploy the chess project using `pulumi` on AWS.
- `@chess/game-engine`: The game engine workspace for the chess project. It contains the necessary code to run
  the chess game logic and UI rendering with PIXI 8. It exposes the core logic and the UI client class.

## Installation

To install the dependencies, run the following command:

```bash
bun install
```

## Development

You need bun (or node, that works too!) and docker installed on your machine to run the development server.

To start the development server, run the following command:

```bash
bun dev
```

## Building

To build the project, run the following command:

```bash
bun run build
```

## Deployment

If you want to host it yourself, you don't need to install the AWS CLI and Pulumi CLI, only the necessary
Cloudflare and AWS environment variables: use the `Dockerfile.Toolkit` to run the infrastructure toolkit
container.

To deploy the infrastructure, fill a `.chess.rc.yaml` file based on the `.chess.rc.example.yaml`, and finally
run the following command:

```bash
bun run deploy
```

**Note**: As it's a server-side generated website (generates static files and host them on s3), you must to
use flexible SSL on Cloudflare.
