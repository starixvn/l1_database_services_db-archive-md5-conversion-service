import type { Metadata } from "@ldb/utils";

export const name = "archive-md5-conversion-service" as const;
export const version = "0.1.0-rc.0" as const;

export const metadata = { name, version } as const satisfies Metadata;
