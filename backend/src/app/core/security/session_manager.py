from hashlib import sha256
from secrets import token_urlsafe


class SessionManager:

    def generate_token(self) -> str:
        return token_urlsafe(32)

    def hash_token(self, token: str) -> str:
        return sha256(token.encode()).hexdigest()


session_manager = SessionManager()
