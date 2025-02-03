/* ---------- External ---------- */
import { join } from "path";

/* ---------- Stacks ---------- */
import { DefaultStack } from "./stacks/Default";

const main = async () => {
  const path = join(__dirname, "../apps/app");
  const environment = process.env.ENVIRONMENT;

  const stack = new DefaultStack("chess", {
    path,
    environment,
    domain: "chess.moureau.dev",
    subdomain: "chess",
  });

  return {
    cname: stack.app.nullstack.website?.websiteEndpoint,
  };
};

export default main();
