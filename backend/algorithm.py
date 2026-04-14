from typing import Dict, List


def recommend_lifting_adjustments(set_feedback: List[Dict[str, str]]) -> Dict[str, str]:
    counts = {"easy": 0, "ok": 0, "hard": 0}
    for feedback in set_feedback:
        felt = feedback.get("felt", "ok").lower()
        if felt in counts:
            counts[felt] += 1

    total_sets = sum(counts.values()) or 1
    if counts["hard"] >= total_sets * 0.5:
        return {
            "weight_delta": "-5",
            "reps_delta": "0",
            "recommendation": "Reduce weight slightly because most sets felt hard.",
        }
    if counts["easy"] >= total_sets * 0.5:
        return {
            "weight_delta": "+5",
            "reps_delta": "0",
            "recommendation": "Increase weight slightly because most sets felt easy.",
        }

    return {
        "weight_delta": "0",
        "reps_delta": "0",
        "recommendation": "Keep the same weight and reps for the next workout.",
    }
