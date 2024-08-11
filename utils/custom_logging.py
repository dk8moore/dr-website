import logging
from colorama import Fore, Style, init

init(autoreset=True)

class ColoredFormatter(logging.Formatter):
    COLORS = {
        'DEBUG': Fore.CYAN,
        'INFO': Fore.GREEN,
        'WARNING': Fore.YELLOW,
        'ERROR': Fore.RED,
        'CRITICAL': Fore.RED + Style.BRIGHT,
    }

    def format(self, record):
        levelname = record.levelname[:5].ljust(5)  # Truncate to 5 characters and pad
        asctime = self.formatTime(record, self.datefmt)
        module = record.module[:8].ljust(8)  # Truncate or pad to 8 characters
        message = record.getMessage()

        level_color = self.COLORS.get(record.levelname, '')

        formatted_msg = f"{level_color}{levelname} {asctime} {Fore.MAGENTA}{module}{Style.RESET_ALL} - {level_color}{message}{Style.RESET_ALL}"

        return formatted_msg

def get_colored_console_handler():
    console_handler = logging.StreamHandler()
    colored_formatter = ColoredFormatter('%(levelname)s %(asctime)s %(module)s - %(message)s')
    console_handler.setFormatter(colored_formatter)
    return console_handler