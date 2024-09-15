// logger.js
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, errors } = format;

// Определяем формат логов
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] : ${stack || message}`;
});

// Создаем логгер
const logger = createLogger({
  level: 'info', // Логируем уровни: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Добавляем метку времени
    errors({ stack: true }), // Логирование стека ошибок
    logFormat // Используем формат, определенный выше
  ),
  transports: [
    // Логи ошибок сохраняем в отдельный файл
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Все логи записываем в другой файл
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Выводим логи в консоль только в режиме разработки
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple(),
  }));
}

export default logger;
