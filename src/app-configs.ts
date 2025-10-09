import type { LumiLoggerConfig } from "@ldb/logger";
import { name, version } from "./metadata.js";
import type { SchedulerConfigs } from "./types/scheduler.js";

export const environment = "DEV" as const;
export const healthcheckPort = 5000 as const;

export const lumiLoggerConfig = {
    sentryNodeOptions: {
        dsn: "https://e83926b2bc60caab91f825f6fce3d658@sentry-k8s.lumigame.com/24",
        environment,
        initialScope: {
            tags: { service: name },
        },
        release: `${name}@${version}`,
    },
    skynexOptions: {
        conversationIds: {
            telegram: -1001911631568,
            slack: "B08GPPK88MS:T08ACMHMMFS:C090SSUCJ10",
        },
    },
    environment,
    terminalSeverityLevel: "debug",
} as const satisfies LumiLoggerConfig;

const mongoCred = "lmn_summary:LmnSummary" as const;
const mongoSrv = "10.10.50.12:39100,10.10.50.13:39100,10.10.50.14:39100" as const;
const mongoRepl = "L1Local" as const;

export const database = {
    mongoURI: `mongodb://${mongoCred}@${mongoSrv}/admin?authSource=admin&appName=${encodeURIComponent(name)}&replicaSet=${mongoRepl}`,
} as const;

export const schedulerConfig = {
    CONVERT: [60_000, 30_000],
} as const satisfies SchedulerConfigs;
