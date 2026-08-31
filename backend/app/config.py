from functools import lru_cache

from dotenv import load_dotenv
import os


load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.provider = os.getenv(
            "CONTROLPLANE_PROVIDER",
            "gemini",
        ).lower()

        self.gemini_api_key = os.getenv(
            "GEMINI_API_KEY",
            "",
        )

        self.anthropic_api_key = os.getenv(
            "ANTHROPIC_API_KEY",
            "",
        )

        self.gemini_fast_model = os.getenv(
            "GEMINI_FAST_MODEL",
            "gemini-2.5-flash",
        )

        self.gemini_deep_model = os.getenv(
            "GEMINI_DEEP_MODEL",
            "gemini-2.5-flash",
        )

        self.anthropic_fast_model = os.getenv(
            "ANTHROPIC_FAST_MODEL",
            "",
        )

        self.anthropic_deep_model = os.getenv(
            "ANTHROPIC_DEEP_MODEL",
            "",
        )

        self.cors_origins = [
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS",
                "http://localhost:5173,http://localhost:3000",
            ).split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()