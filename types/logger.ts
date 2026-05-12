export type LogLevel = "INFO" | "DEBUG" | "ERROR";

export interface LogOptions {
  level: LogLevel;
  json?: boolean;
}