/* ---------- External ---------- */
import { ComponentResource, ComponentResourceOptions, Output } from "@pulumi/pulumi";
import { Record, RecordArgs } from "@pulumi/cloudflare";

/* ---------- Interfaces ---------- */
interface CnameProps {
  cname?: Output<string>;
  type: "CNAME";
}

interface AProps {
  a?: Output<string>;
  type: "A";
}

interface BaseProps {
  environment: string;
  subdomain: string;
  name: string;
  comment?: RecordArgs["comment"];
  proxied?: boolean;
}

/* ---------- Types ---------- */
type DNSProps = CnameProps | AProps;
type Props = DNSProps & BaseProps;

export class DNSResource extends ComponentResource {
  public readonly record: Record;

  public constructor(name: string, props: Props, opts?: ComponentResourceOptions) {
    super(`${name}:index:${props.environment}`, name, {}, opts);

    const { type, environment, subdomain, name: resourceName, comment, proxied = true } = props;

    if (props.type === "CNAME" && !props.cname) throw new Error(`Missing ${resourceName} CNAME.`);
    if (props.type === "A" && !props.a) throw new Error(`Missing ${resourceName} A.`);

    this.record = new Record(
      `${resourceName}-record-${environment}`,
      {
        name: subdomain,
        zoneId: process.env.CLOUDFLARE_ZONE_ID,
        type,
        comment,
        ttl: 1,
        proxied,
        content: props.type === "CNAME" ? props.cname : props.a,
      },
      { parent: this, deleteBeforeReplace: true },
    );
  }
}
