import type { ChangeStreamNameSpace } from "@ldb/mongo";

export const namespaces = {
    md5ConfigsNamespace: { db: "ops_configs", coll: "md5_configs" },
} as const satisfies Record<string, ChangeStreamNameSpace>;
