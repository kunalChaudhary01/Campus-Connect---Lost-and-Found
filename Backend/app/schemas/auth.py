import re


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_registration(payload):
    required = ["name", "email", "password", "college", "student_id"]
    missing = [field for field in required if not str(payload.get(field, "")).strip()]
    if missing:
        return f"Missing required fields: {', '.join(missing)}"
    if not EMAIL_PATTERN.match(payload["email"].strip().lower()):
        return "Enter a valid email address"
    if len(payload["password"]) < 8:
        return "Password must be at least 8 characters"
    return None


def validate_login(payload):
    if not str(payload.get("email", "")).strip() or not payload.get("password"):
        return "Email and password are required"
    return None
