# @chess/game-engine

This package contains the game engine for the chess game, both the logic (headless simulation) and the UI.

The UI is implemented using Pixi.js and needs an HTML element to be mounted on.

## Usage

```javascript
import { Client } from "@chess/game-engine";

const client = new Client({
  element: document.getElementById("game"),
});

client.start();
```
