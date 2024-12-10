import { asClass, asValue, BaseContainer } from "@ldb/base-container";
import type { MongoClient } from "@ldb/mongo";
import { healthcheckPort, lumiLoggerConfig, schedulerConfig } from "./app-configs.js";
import { App } from "./app.js";
import { metadata } from "./metadata.js";

export class Container extends BaseContainer {
    constructor() {
        super();
    }

    register() {
        this.registerLogger(lumiLoggerConfig).registerHealthcheck(metadata, healthcheckPort).registerScheduler(schedulerConfig).registerClasses();
        return this;
    }

    private registerClasses() {
        this.container.register({
            app: asClass(App).singleton(),
        });
        return this;
    }

    registerDatabases(mongo: MongoClient) {
        this.container.register({
            mongo: asValue(mongo),
        });

        return this;
    }
}
