import winston from 'winston'
import { format } from 'date-fns'

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  format: winston.format.printf(info => {
    return `[${format(
            new Date(),
            'yyyy-MM-dd HH:mm:ss'
          )}] - ${info.level.toUpperCase()} - ${info.message} /\n`
  }),
  transports: [
    new winston.transports.File({
      filename: 'info.log',
      level: 'info',
      handleExceptions: true,
      maxsize: 10485760,
      maxFiles: 20
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
