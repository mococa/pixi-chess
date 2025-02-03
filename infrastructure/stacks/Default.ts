/* ---------- External ---------- */
import { ComponentResource, ComponentResourceOptions } from "@pulumi/pulumi";

/* ---------- Resources ---------- */
import { NullstackResource } from "../resources/nullstack";
import { DNSResource } from "../resources/dns";

/* ---------- Interfaces ---------- */
interface DefaultStackProps {
  /**
   * @description
   * Application environment, such as development, staging, production...
   */
  environment: string;

  /**
   * @description
   * Path to the application source code.
   */
  path: string;

  /**
   * @description
   * Domain for the application, including subdomain.
   *
   * @example
   * "chess.nullstack.app"
   */
  domain: string;

  /**
   * @description
   * Subdomain for the application on cloudflare, if any.
   *
   * @example
   * "chess"
   *
   * @default
   * "@"
   */
  subdomain?: string;
}

/**
 * @description
 * Default stack for the application, containing all the resources used
 * to deploy the application.
 */
export class DefaultStack extends ComponentResource {
  app: NullstackResource;
  dns: DNSResource;

  public constructor(name: string, props: DefaultStackProps, opts?: ComponentResourceOptions) {
    super(`${name}:index:${props.environment}`, name, {}, opts);

    const { path, environment, domain, subdomain = "@" } = props;

    if (!path) throw new Error("Missing application path");
    if (!environment) throw new Error("Missing an environment");
    if (!domain) throw new Error("Missing domain");
    if (!subdomain) throw new Error("Missing subdomain");

    this.app = new NullstackResource(
      "app",
      {
        environment,
        path,
        mode: "ssg",
        domain,
      },
      { parent: this },
    );

    this.dns = new DNSResource(
      "dns",
      {
        environment,
        name: "nullstack chess",
        subdomain,
        type: "CNAME",
        comment: "DNS for the chess nullstack application",
        cname: this.app.nullstack.website?.websiteEndpoint,
      },
      { parent: this, dependsOn: this.app.nullstack.website },
    );
  }
}
