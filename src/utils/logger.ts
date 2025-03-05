export type LogMethod = "error" | "warn" | "info" | "debug";
export type LogLevel = LogMethod | "silent";

export interface LoggerInterface {
	debug(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
}

export class Logger implements LoggerInterface {
	private static logLevel: LogLevel = "info";
	private static useColors: boolean = true;
	private static prefix: string = "[POSTAL-CODE-SCRAPER]";
	private static instance: LoggerInterface;

	static configure(config: { level?: LogLevel; colors?: boolean; prefix?: string; logger?: LoggerInterface }): void {
		if (config.level) this.logLevel = config.level;
		if (config.colors !== undefined) this.useColors = config.colors;
		if (config.prefix) this.prefix = config.prefix;
		if (config.logger) this.instance = config.logger;
	}

	static getInstance(): LoggerInterface {
		return this.instance || new Logger();
	}

	static debug(message: string, ...args: any[]): void {
		this.log("debug", message, args);
	}

	static info(message: string, ...args: any[]): void {
		this.log("info", message, args);
	}

	static warn(message: string, ...args: any[]): void {
		this.log("warn", message, args);
	}

	static error(message: string, ...args: any[]): void {
		this.log("error", message, args);
	}

	private static shouldLog(level: LogLevel): boolean {
		if (this.logLevel === "silent") return false;

		const levels: LogMethod[] = ["error", "warn", "info", "debug"];
		return levels.indexOf(level as LogMethod) <= levels.indexOf(this.logLevel as LogMethod);
	}

	private static log(level: LogMethod, message: string, args: any[]): void {
		if (!this.shouldLog(level)) return;

		const logger = this.getInstance();
		const formatted = this.formatMessage(level, message);

		logger[level](formatted, ...args);
	}

	private static formatMessage(level: LogMethod, message: string): string {
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

	private static getLevelColor(level: LogMethod): string {
		if (!this.useColors) return "";

		return {
			error: "\x1b[31m", // Red
			warn: "\x1b[33m", // Yellow
			info: "\x1b[36m", // Cyan
			debug: "\x1b[35m", // Magenta
		}[level];
	}

	// Instance methods to implement LoggerInterface
	debug(message: string, ...args: any[]): void {
		console.debug(message, ...args);
	}

	info(message: string, ...args: any[]): void {
		console.log(message, ...args);
	}

	warn(message: string, ...args: any[]): void {
		console.warn(message, ...args);
	}

	error(message: string, ...args: any[]): void {
		console.error(message, ...args);
	}
}
