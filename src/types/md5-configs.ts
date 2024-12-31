import type { ChangeStreamNameSpace } from "@ldb/mongo";

export type MD5Configs = {
    _id: ChangeStreamNameSpace;
    fields: string[];
};
