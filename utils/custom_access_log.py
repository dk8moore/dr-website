from daphne.access import AccessLogGenerator
from colorama import Fore, Style, init
import time

init(autoreset=True)

class ColoredAccessLogGenerator(AccessLogGenerator):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def write(self, status, client_addr, request_line, protocol, duration, length):
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
        formatted_message = (
            f"{Fore.GREEN}INFO  {timestamp} access   - "
            f"{client_addr} - - [{time.strftime('%d/%b/%Y:%H:%M:%S')}] "
            f"\"{request_line}\" {status} {length}{Style.RESET_ALL}"
        )
        self.stream.write(formatted_message + "\n")
        self.stream.flush()