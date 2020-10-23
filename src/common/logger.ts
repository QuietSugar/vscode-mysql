import * as Log4js from 'log4js';
import * as path from 'path';

export class Logger {
  private log4js: Log4js.Log4js;
  private static _instance: Logger | null;
  private _level?: string;

  private constructor() {
    // const configure = Config.util.loadFileConfigs(path.join(__dirname, '../../config')).log4js;
    // this.log4js = Log4js.configure(configure as Log4js.Configuration);
    this.log4js = Log4js.configure({
        //配置不同的输出目的地
        appenders: {
            logFile: {
                type: 'file',
                filename: './logs/log.log',
                maxLogSize: 5000000,
                backups: 5,
                replaceConsole: true
            },
            console: {
                type: 'console',
                replaceConsole: true
            },
        },
        //配置不同的logger类别
        categories: {
            default: { appenders: ['console', 'logFile'], level: 'trace' },
        },
    });
    this._level;
  }

  public static get instance(): Logger {
    if (!this._instance) {
      return (this._instance = new Logger());
    }
    return this._instance;
  }

  public connectLogger(_level: string | undefined): any {
    return this.log4js.connectLogger(this.log4js.getLogger('access'), { level: _level });
  }

  public info(message: any, ...args: any[]): void {
    const logger = this.log4js.getLogger('access');
    logger.level = 'info';
    logger.info(message,...args);
  }

  public warn(message: any, ...args: any[]): void {
    const logger = this.log4js.getLogger('access');
    logger.level = 'warn';
    logger.warn(message,...args);
  }

  public error(message: any, ...args: any[]): void {
    const logger = this.log4js.getLogger('access');
    logger.level = 'error';
    logger.error(message,...args);
  }

  public debug(message: any, ...args: any[]): void {
    const logger = this.log4js.getLogger('debug');
    logger.level = 'debug';
    logger.debug(message,...args);
  }

  public setLevel(_level: string): void {
    return this.log4js.connectLogger(this.log4js.getLogger('access'), { level: _level });
  } 
  public trace(message: any, ...args: any[]): void {
    const logger = this.log4js.getLogger('trace');
    logger.level = 'trace';
    logger.trace(message,...args);
  }
  public fatal(message: any, ...args: any[]): void {
    const logger = this.log4js.getLogger('access');
    logger.level = 'fatal';
    logger.fatal(message,...args);
  }
}