from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # DeepSeek API (default provider)
    deepseek_api_key: str = ""
    deepseek_api_base: str = "https://api.deepseek.com/v1"

    # OpenAI API (alternative)
    openai_api_key: str = ""
    openai_api_base: str = "https://api.openai.com/v1"

    # LLM Provider: "deepseek" (default) or "openai"
    llm_provider: str = "deepseek"

    # CORS — comma-separated list. Default covers prod domain + Vite dev server.
    # Set to "*" only for explicit local-debug situations.
    allowed_origins: str = (
        "https://plus.drziangchen.uk,http://localhost:5173,http://localhost:4173"
    )

    # API Key gate (Phase 1: optional; Phase 3: required)
    api_key: str = ""
    api_key_required: bool = False

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
