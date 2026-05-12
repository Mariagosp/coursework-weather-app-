type LogLevel = "INFO" | "DEBUG" | "ERROR";

interface LogOptions {
  level: LogLevel;
  json?: boolean;
}

export function log(options: LogOptions) {
  return function <T extends (...args: any[]) => any>(fn: T) {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const start = Date.now();
      const timestamp = new Date().toISOString();

      try {
        if (options.level !== "ERROR") {
          const inputLog = {
            timestamp,
            level: options.level,
            function: fn.name,
            args,
          };

          console.log(
            options.json
              ? JSON.stringify(inputLog)
              : inputLog
          );
        }

        const result = await fn(...args);

        if (options.level !== "ERROR") {
          const outputLog = {
            timestamp,
            level: options.level,
            function: fn.name,
            result,
            executionTime: `${Date.now() - start}ms`,
          };

          console.log(
            options.json
              ? JSON.stringify(outputLog)
              : outputLog
          );
        }

        return result;
      } catch (error) {
        const errorLog = {
          timestamp,
          level: "ERROR",
          function: fn.name,
          error,
          executionTime: `${Date.now() - start}ms`,
        };

        console.log(
          options.json
            ? JSON.stringify(errorLog)
            : errorLog
        );

        throw error;
      }
    };
  };
}