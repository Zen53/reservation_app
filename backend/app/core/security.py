def create_fake_token(user_id: str, role: str) -> str:
    # MOCK TOKEN
    return f"fake-token-{user_id}-{role}"

def decode_fake_token(token: str):
    try:
        _, _, user_id, role = token.split("-")
        return {"user_id": user_id, "role": role}
    except Exception:
        return None
