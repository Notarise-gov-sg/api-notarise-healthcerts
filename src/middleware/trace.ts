import { getLogger } from "../common/logger";

// Work around to stub the logging module in cloudwatch.test.ts
export const { trace, error: logError } = getLogger("cloudWatchMiddleware");
