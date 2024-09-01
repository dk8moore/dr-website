import os
import sys
import time
from pathlib import Path

# Add the project root directory to the Python path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from daphne.cli import CommandLineInterface
from daphne.server import Server
from django.core.management import execute_from_command_line
import threading
import logging
from custom_logging import get_colored_console_handler
import logging

class ReloadHandler(FileSystemEventHandler):
    def __init__(self, callback):
        self.callback = callback
        self.last_reload = 0

    def on_any_event(self, event):
        if event.is_directory:
            return
        if time.time() - self.last_reload < 1:  # Debounce reloads
            return
        if event.src_path.endswith('.py'):
            print(f"Change detected in {event.src_path}. Reloading...")
            self.last_reload = time.time()
            self.callback()

def restart_daphne():
    os.execv(sys.executable, [sys.executable] + sys.argv)

def configure_logging():
    # Remove all handlers from the root logger
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    # Configure the colored console handler
    handler = get_colored_console_handler()

    # Set up the root logger
    logging.root.setLevel(logging.INFO)
    logging.root.addHandler(handler)

    # Set up the Daphne logger
    daphne_logger = logging.getLogger('daphne')
    daphne_logger.setLevel(logging.INFO)
    daphne_logger.addHandler(handler)

    # Prevent the Daphne logger from propagating to the root logger
    daphne_logger.propagate = False

    # Set up the Django logger
    django_logger = logging.getLogger('django')
    django_logger.setLevel(logging.INFO)
    django_logger.addHandler(handler)

    # Set up the Twisted logger
    twisted_logger = logging.getLogger('twisted')
    twisted_logger.setLevel(logging.INFO)
    twisted_logger.addHandler(handler)

    return daphne_logger

def run_daphne():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    # Collect static files
    execute_from_command_line(["", "collectstatic", "--noinput"])

    # Configure logging and set Daphne's logger
    logger = configure_logging()
    Server.logger = logger

    watch_dirs = [
        'config',
        'core',
        'utils',
        # Add other app directories here
    ]

    event_handler = ReloadHandler(restart_daphne)
    observer = Observer()
    for directory in watch_dirs:
        observer.schedule(event_handler, directory, recursive=True)

    observer.start()

    def run_daphne_server():
        cli = CommandLineInterface()
        cli.run([
            "-e", "ssl:8000:privateKey=ssl/localhost.key:certKey=ssl/localhost.crt",
            "--access-log", "-",
            "config.asgi:application"
        ])

    daphne_thread = threading.Thread(target=run_daphne_server)
    daphne_thread.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    run_daphne()
