import { BaseApp } from "@ldb/base-app";
import type { BaseLogger } from "@ldb/logger";
import type { Scheduler } from "@ldb/scheduler";
import type { Metadata } from "@ldb/utils";
import type { MD5Converter } from "./converters/md5-converter.js";
import type { MD5Initiator } from "./initiators/md5-initiator.js";
import type { SchedulerKeys } from "./types/scheduler.js";

export class App extends BaseApp {
    constructor(
        private readonly scheduler: Scheduler<SchedulerKeys>,
        private readonly md5Initiator: MD5Initiator,
        private readonly md5Converter: MD5Converter,
        metadata: Metadata,
        logger: BaseLogger,
    ) {
        super(metadata, logger);
    }

    initiate() {
        this.md5Converter.subscribe(this.md5Initiator);
        this.md5Initiator.subscribe(this.scheduler);
        super.initiate();
        this.scheduler.emit("CONVERT");
    }

    terminate() {
        this.md5Initiator.unsubscribe(this.scheduler);
        this.md5Converter.unsubscribe(this.md5Initiator);
        super.terminate();
    }
}
