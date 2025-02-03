/* ---------- External ---------- */
const { execSync } = require("child_process");

/* ---------- Constants ---------- */
const environment = process.argv.find((arg) => arg.includes("environment"));
if (!environment) throw new Error("Please provide an environment like this: --environment=development");
const {
  AWS_REGION,
  AWS_PROFILE,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  PULUMI_ACCESS_TOKEN,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ZONE_ID,
} = process.env;

/* ---------- Env ---------- */
if (!AWS_PROFILE) throw new Error("Please provide AWS profile name on `.chess.rc.yaml`");
if (!AWS_REGION) throw new Error("Please provide an AWS region on `.chess.rc.yaml`");
if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY) throw new Error("Please provide AWS credentials on `.chess.rc.yaml`");
if (!PULUMI_ACCESS_TOKEN) throw new Error("Please provide Pulumi access token on `.chess.rc.yaml`");
if (!CLOUDFLARE_API_TOKEN) throw new Error("Please provide Cloudflare API token on `.chess.rc.yaml`");
if (!CLOUDFLARE_ZONE_ID) throw new Error("Please provide Cloudflare zone ID on `.chess.rc.yaml`");

/* ---------- Script ---------- */
/**
 * @description
 * Parsed environment from arguments, such as development, production, etc.
 */
const stack = parse(environment).value;
process.env["ENVIRONMENT"] = stack;

execSync(`pulumi up --stack ${stack} --skip-preview`, { stdio: "inherit" });

/* ---------- Helpers ---------- */
/**
 * @description
 * Parses an argument in the form of key=value
 *
 * @param {string} arg Argument to parse
 * @returns {{key: string, value: string}} Parsed argument
 */
function parse(arg) {
  const [key, value] = arg.split("=");
  if (!key || !value) throw new Error("Invalid argument format. Please use key=value");

  return { key, value };
}
