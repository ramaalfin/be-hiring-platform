import { NODE_ENV } from "../constants/env";

export enum LogLevel {
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG",
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    data?: any;
    error?: any;
}

class Logger {
    private formatLog(entry: LogEntry): string {
        const { timestamp, level, message, context, data, error } = entry;
        let log = `[${timestamp}] [${level}]`;

        if (context) {
            log += ` [${context}]`;
        }

        log += ` ${message}`;

        if (data) {
            log += ` ${JSON.stringify(data)}`;
        }

        if (error) {
            log += `\n${error.stack || error}`;
        }

        return log;
    }

    private log(level: LogLevel, message: string, context?: string, data?: any, error?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            data,
            error,
        };

        const formattedLog = this.formatLog(entry);

        // In production, you would send this to a logging service (e.g., Winston, Sentry)
        switch (level) {
            case LogLevel.ERROR:
                console.error(formattedLog);
                break;
            case LogLevel.WARN:
                console.warn(formattedLog);
                break;
            case LogLevel.INFO:
                console.info(formattedLog);
                break;
            case LogLevel.DEBUG:
                if (NODE_ENV === "development") {
                    console.debug(formattedLog);
                }
                break;
        }
    }

    error(message: string, error?: any, context?: string, data?: any) {
        this.log(LogLevel.ERROR, message, context, data, error);
    }

    warn(message: string, context?: string, data?: any) {
        this.log(LogLevel.WARN, message, context, data);
    }

    info(message: string, context?: string, data?: any) {
        this.log(LogLevel.INFO, message, context, data);
    }

    debug(message: string, context?: string, data?: any) {
        this.log(LogLevel.DEBUG, message, context, data);
    }
}

export const logger = new Logger();
