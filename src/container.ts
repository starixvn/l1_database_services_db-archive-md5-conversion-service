import { asClass, asValue, BaseContainer } from "@ldb/base-container";
import type { MongoClient } from "@ldb/mongo";
import { healthcheckPort, lumiLoggerConfig, schedulerConfig } from "./app-configs.js";
import { App } from "./app.js";
import { MD5Converter } from "./converters/md5-converter.js";
import { MD5Initiator } from "./initiators/md5-initiator.js";
import { metadata } from "./metadata.js";
import { namespaces } from "./namespace.js";

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
            md5Initiator: asClass(MD5Initiator).singleton(),
            md5Converter: asClass(MD5Converter).singleton(),
        });
        return this;
    }

    registerDatabases(mongo: MongoClient) {
        this.container.register({
            mongo: asValue(mongo),
        });

        for (const [name, value] of Object.entries(namespaces)) {
            this.container.register({
                [name]: asValue(value),
            });
        }

        return this;
    }
}
