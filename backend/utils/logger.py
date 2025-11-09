"""
Centralized Logging Configuration
Single source of truth for all application logging
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from datetime import datetime


# Log directory
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Log format
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
DATE_FORMAT = '%Y-%m-%d %H:%M:%S'


def setup_logging():
    """
    Configure root logger with console and file handlers
    Call this once at application startup
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()
    
    # Console Handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    console_handler.setFormatter(console_formatter)
    
    # File Handler with rotation (10MB per file, keep 5 files)
    log_file = LOG_DIR / f"app_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.INFO)
    file_formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    file_handler.setFormatter(file_formatter)
    
    # Add handlers to root logger
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    # Log startup message
    root_logger.info("="*50)
    root_logger.info("Application logging initialized")
    root_logger.info(f"Log file: {log_file}")
    root_logger.info("="*50)


def get_logger(name: str = None) -> logging.Logger:
    """
    Get a logger instance for a module
    
    Usage:
        from utils.logger import get_logger
        logger = get_logger(__name__)
        logger.info("Message")
    
    Args:
        name: Logger name (use __name__ for module-specific logging)
    
    Returns:
        Configured logger instance
    """
    if name is None:
        name = "app"
    
    logger = logging.getLogger(name)
    
    # Don't propagate if it's a child logger to avoid duplicate logs
    if '.' in name:
        logger.propagate = True
    
    return logger


def set_log_level(level: str):
    """
    Change log level at runtime
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    logging.getLogger().setLevel(numeric_level)
    
    for handler in logging.getLogger().handlers:
        handler.setLevel(numeric_level)
    
    logging.info(f"Log level changed to {level.upper()}")


# Convenience functions for quick logging without creating logger instance
def info(msg: str, *args, **kwargs):
    """Quick info log"""
    logging.info(msg, *args, **kwargs)


def error(msg: str, *args, **kwargs):
    """Quick error log"""
    logging.error(msg, *args, **kwargs)


def warning(msg: str, *args, **kwargs):
    """Quick warning log"""
    logging.warning(msg, *args, **kwargs)


def debug(msg: str, *args, **kwargs):
    """Quick debug log"""
    logging.debug(msg, *args, **kwargs)


def critical(msg: str, *args, **kwargs):
    """Quick critical log"""
    logging.critical(msg, *args, **kwargs)
