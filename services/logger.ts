import { LogOptions } from "../types/logger";

export function log(options: LogOptions) {
  return function <T extends (...args: any[]) => any>(fn: T) {
    return async (...args: Parameters<T>) => {
      const start = Date.now();
      const timestamp = new Date().toISOString();

      const shouldLog = options.level !== "ERROR";

      try {
        if (shouldLog) {
          const inputLog = {
            timestamp,
            level: options.level,
            function: fn.name || "anonymous",
            args,
          };

          console.log(
            options.json ? JSON.stringify(inputLog) : inputLog
          );
        }

        const result = await fn(...args);

        if (shouldLog) {
          const outputLog = {
            timestamp,
            level: options.level,
            function: fn.name || "anonymous",
            result,
            executionTime: `${Date.now() - start}ms`,
          };

          console.log(
            options.json ? JSON.stringify(outputLog) : outputLog
          );
        }

        return result;
      } catch (error) {
        const errorLog = {
          timestamp,
          level: "ERROR",
          function: fn.name || "anonymous",
          args,
          error,
          executionTime: `${Date.now() - start}ms`,
        };

        console.log(
          options.json ? JSON.stringify(errorLog) : errorLog
        );

        throw error;
      }
    };
  };
}
