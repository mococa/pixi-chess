import Nullstack, { NullstackClientContext } from "nullstack";

import { Client } from "@chess/game-engine";

class Home extends Nullstack {
  element: HTMLDivElement;

  hydrate() {
    const client = new Client({ element: this.element });
    client.start();
  }

  render() {
    return (
      <main class="w-full min-h-screen flex items-center">
        <div ref={this.element} class="flex w-full h-full" />
      </main>
    );
  }
}

export default Home;
