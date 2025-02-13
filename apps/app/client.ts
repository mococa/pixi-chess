import Nullstack, { NullstackClientContext } from "nullstack";

import Application from "./src/Application";

const context = Nullstack.start(Application) as NullstackClientContext;

context.start = async function start() {
  // https://nullstack.app/application-startup
};

export default context;
