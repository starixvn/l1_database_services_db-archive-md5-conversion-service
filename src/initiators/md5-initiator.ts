import type { BaseLogger } from "@ldb/logger";
import type { ChangeStreamNameSpace, MongoClient } from "@ldb/mongo";
import type { Scheduler } from "@ldb/scheduler";
import { Dispatcher } from "@ldb/utils";
import type { MD5Configs } from "../types/md5-configs.js";
import type { SchedulerEvents, SchedulerKeys } from "../types/scheduler.js";

export type MD5InitiatorEvents = {
    INITIATE: (config: MD5Configs) => void;
};

export class MD5Initiator extends Dispatcher<MD5InitiatorEvents, SchedulerEvents> {
    constructor(
        private readonly mongo: MongoClient,
        private readonly md5ConfigsNamespace: ChangeStreamNameSpace,
        logger: BaseLogger,
    ) {
        super(logger);
        this.selfBound();
    }

    private selfBound() {
        this.initiate = this.initiate.bind(this);
    }

    private get md5ConfigsCollection() {
        return this.mongo.db(this.md5ConfigsNamespace.db).collection<MD5Configs>(this.md5ConfigsNamespace.coll);
    }

    private async initiate() {
        const md5ConfigCursor = this.getMD5Configs();

        for await (const md5Config of md5ConfigCursor) {
            this.emitMD5Config(md5Config);
        }
    }

    private getMD5Configs() {
        return this.md5ConfigsCollection.find();
    }

    private emitMD5Config(md5Config: MD5Configs) {
        this.emit("INITIATE", md5Config);
    }

    subscribe(publisher: Scheduler<SchedulerKeys>) {
        return super.subscribe(publisher, "CONVERT", this.initiate);
    }

    unsubscribe(publisher: Scheduler<SchedulerKeys>) {
        return super.unsubscribe(publisher, "CONVERT", this.initiate);
    }
}
