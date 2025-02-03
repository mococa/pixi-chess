/* ---------- External ---------- */
import { PulumiNullstack, ServerlessApp } from "nullstack-serverless-pulumi-aws";
import { ComponentResource, ComponentResourceOptions, Input, Output, output } from "@pulumi/pulumi";

/* ---------- Interfaces ---------- */
interface Props {
  /**
   * Application environment, such as development, staging, production...
   */
  environment: string;

  /**
   * Nullstack App path that contains the .production folder
   */
  path: string;

  /**
   * Environment variables
   */
  env?: Record<string, Input<string>>;

  /**
   * Hostname
   *
   * If provided, the hostname will be used instead of the default hostname
   *
   * Example: www.example.com
   */
  hostname?: string;

  /**
   * Certificate ARN
   *
   * If provided, the certificate will be used instead of the default certificate
   *
   * Example: 0000000000000000000000000000000000:certificate/000000000000000000-00000000000000000
   */
  certificate?: string | Output<string>;

  /**
   * Nullstack Build mode
   *
   * SSR | SSG | SPA
   */
  mode?: "ssr" | "spa" | "ssg";

  /**
   * Domain for static build types (names bucket after this)
   */
  domain?: string;
}

export class NullstackResource extends ComponentResource {
  public readonly nullstack: PulumiNullstack;
  public readonly serverless?: ServerlessApp;

  public constructor(name: string, props: Props, opts?: ComponentResourceOptions) {
    super(`${name}:index:${props.environment}`, name, {}, opts);

    const { environment, path, certificate, env, hostname, mode, domain } = props;

    this.nullstack = new PulumiNullstack(
      `${name}-app`,
      {
        environment,
        env: env || {},
        nullstack_app_path: path,
        mode,
        remove_dot_html: true,
        domain,
      },
      { parent: this },
    );

    if (mode !== "ssr") return;

    if (!hostname || !certificate)
      throw new Error("Hostname and certificate are needed for Nullstack SSR deployments.");

    this.serverless = new ServerlessApp(
      `${name}-serverless`,
      {
        environment,
        lambda_fn: this.nullstack.lambda_fn,
        hostname: output(hostname),
        certificate_arn: output(certificate),
      },
      { ...opts, dependsOn: this.nullstack.lambda_fn, parent: this },
    );
  }
}
