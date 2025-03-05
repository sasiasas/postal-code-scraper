"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static configure(config) {
        if (config.level)
            this.logLevel = config.level;
        if (config.colors !== undefined)
            this.useColors = config.colors;
        if (config.prefix)
            this.prefix = config.prefix;
        if (config.logger)
            this.instance = config.logger;
    }
    static getInstance() {
        return this.instance || new Logger();
    }
    static debug(message, ...args) {
        this.log("debug", message, args);
    }
    static info(message, ...args) {
        this.log("info", message, args);
    }
    static warn(message, ...args) {
        this.log("warn", message, args);
    }
    static error(message, ...args) {
        this.log("error", message, args);
    }
    static shouldLog(level) {
        if (this.logLevel === "silent")
            return false;
        const levels = ["error", "warn", "info", "debug"];
        return levels.indexOf(level) <= levels.indexOf(this.logLevel);
    }
    static log(level, message, args) {
        if (!this.shouldLog(level))
            return;
        const logger = this.getInstance();
        const formatted = this.formatMessage(level, message);
        logger[level](formatted, ...args);
    }
    static formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        const levelColor = this.getLevelColor(level);
        const messageColor = this.useColors ? "\x1b[37m" : "";
        return [
            this.useColors ? "\x1b[90m" : "",
            `${this.prefix} `,
            `${timestamp} `,
            levelColor,
            `[${level.toUpperCase()}]`,
            this.useColors ? "\x1b[0m" : "",
            messageColor,
            ` ${message}`,
            this.useColors ? "\x1b[0m" : "",
        ].join("");
    }
    static getLevelColor(level) {
        if (!this.useColors)
            return "";
        return {
            error: "\x1b[31m", // Red
            warn: "\x1b[33m", // Yellow
            info: "\x1b[36m", // Cyan
            debug: "\x1b[35m", // Magenta
        }[level];
    }
    // Instance methods to implement LoggerInterface
    debug(message, ...args) {
        console.debug(message, ...args);
    }
    info(message, ...args) {
        console.log(message, ...args);
    }
    warn(message, ...args) {
        console.warn(message, ...args);
    }
    error(message, ...args) {
        console.error(message, ...args);
    }
}
exports.Logger = Logger;
Logger.logLevel = "info";
Logger.useColors = true;
Logger.prefix = "[POSTAL-CODE-SCRAPER]";
//# sourceMappingURL=logger.js.map