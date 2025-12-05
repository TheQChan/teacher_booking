import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_PROJECT = ROOT_DIR.parent / "backend" / "teacher_booking"

if not BACKEND_PROJECT.exists():
    raise FileNotFoundError(f"Backend project not found at {BACKEND_PROJECT}")

sys.path.insert(0, str(BACKEND_PROJECT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "teacher_booking.settings")

import django

django.setup()
