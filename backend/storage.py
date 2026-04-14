import json
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _data_file(filename: str) -> Path:
    return DATA_DIR / filename


def read_json(filename: str, default: Any) -> Any:
    file_path = _data_file(filename)
    if not file_path.exists():
        return default
    with file_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(filename: str, payload: Any) -> Any:
    file_path = _data_file(filename)
    with file_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
    return payload


def load_exercises() -> list[dict]:
    return read_json("exercises.json", [])


def save_exercises(exercises: list[dict]) -> list[dict]:
    return write_json("exercises.json", exercises)


def load_workouts() -> list[dict]:
    return read_json("workouts.json", [])


def save_workouts(workouts: list[dict]) -> list[dict]:
    return write_json("workouts.json", workouts)


def load_workout_plans() -> list[dict]:
    return read_json("workout_plans.json", [])


def save_workout_plans(plans: list[dict]) -> list[dict]:
    return write_json("workout_plans.json", plans)
