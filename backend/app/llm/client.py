"""
Fix from review: the frontend's model selector (Claude / GPT / Gemini) was
cosmetic — every call used a fixed FAST_MODEL/DEEP_MODEL from env vars
regardless of what the user picked. Every function here now takes an
explicit provider+model, resolved from the request's `model` label by
resolve_model() — nothing falls back to a hidden global unless the caller
passes nothing at all (used by internal checks that don't care which
provider answers, only that one does).
"""

import json
import os
from typing import Any, Optional

from dotenv import load_dotenv

load_dotenv()  # fixes: .env was never actually loaded into the process before

MODEL_LABEL_MAP: dict[str, tuple[str, str]] = {
    "Claude": ("anthropic", "claude-sonnet-4-6"),
    "GPT": ("openai", "gpt-5.1"),
    "Gemini": ("gemini", "gemini-2.5-flash"),
}

# Fast, cheap models for Tier-1 classification-style checks — deliberately
# NOT the heaviest model in each family (review point 7: Flash/Flash-Lite
# for checks, not Pro, to keep this affordable at hackathon volume)
FAST_MODEL_BY_PROVIDER = {
    "anthropic": "claude-haiku-4-5-20251001",
    "openai": "gpt-5.1-mini",
    "gemini": "gemini-2.5-flash-lite",
}


class LLMUnavailable(Exception):
    pass


def resolve_model(model_label: str) -> tuple[str, str]:
    """Turns the frontend's 'Claude'/'GPT'/'Gemini' selector value into a
    real (provider, model) pair. This is the one place that mapping lives."""
    return MODEL_LABEL_MAP.get(model_label, MODEL_LABEL_MAP["Claude"])


_clients: dict[str, Any] = {}


def _get_client(provider: str):
    if provider in _clients:
        return _clients[provider]

    if provider == "anthropic":
        key = os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            return None
        import anthropic
        _clients[provider] = anthropic.AsyncAnthropic(api_key=key)

    elif provider == "gemini":
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            return None
        from google import genai
        _clients[provider] = genai.Client(api_key=key)

    elif provider == "openai":
        key = os.environ.get("OPENAI_API_KEY")
        if not key:
            return None
        import openai
        _clients[provider] = openai.AsyncOpenAI(api_key=key)

    else:
        raise LLMUnavailable(f"unknown provider '{provider}'")

    return _clients[provider]


def any_provider_live() -> bool:
    return any(_get_client(p) is not None for p in ("anthropic", "gemini", "openai"))


def resolve_check_provider() -> Optional[str]:
    """Returns the first provider with a live key configured, in a sensible
    priority order, or None if nothing is configured — callers use this to
    decide once per pipeline run whether to even attempt an LLM call before
    falling back to a heuristic, rather than every check independently
    trying and catching LLMUnavailable."""
    for provider in ("anthropic", "gemini", "openai"):
        if _get_client(provider) is not None:
            return provider
    return None


async def structured_call(
    system_prompt: str,
    user_prompt: str,
    json_schema: dict[str, Any],
    provider: str = "anthropic",
    model: Optional[str] = None,
    max_tokens: int = 600,
) -> dict[str, Any]:
    model = model or FAST_MODEL_BY_PROVIDER[provider]
    client = _get_client(provider)
    if client is None:
        raise LLMUnavailable(f"no API key configured for provider '{provider}'")

    if provider == "anthropic":
        response = await client.messages.create(
            model=model, max_tokens=max_tokens, system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            tools=[{"name": "respond", "description": "Return the structured result.",
                    "input_schema": json_schema}],
            tool_choice={"type": "tool", "name": "respond"},
        )
        for block in response.content:
            if block.type == "tool_use" and block.name == "respond":
                return block.input
        raise LLMUnavailable("model did not return a structured tool call")

    if provider == "gemini":
        response = await client.aio.models.generate_content(
            model=model, contents=f"{system_prompt}\n\n{user_prompt}",
            config={"response_mime_type": "application/json", "response_schema": json_schema},
        )
        return json.loads(response.text)

    if provider == "openai":
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            tools=[{"type": "function", "function": {
                "name": "respond", "description": "Return the structured result.", "parameters": json_schema}}],
            tool_choice={"type": "function", "function": {"name": "respond"}},
        )
        call = response.choices[0].message.tool_calls[0]
        return json.loads(call.function.arguments)

    raise LLMUnavailable(f"unknown provider '{provider}'")


async def free_text_call(
    system_prompt: str, user_prompt: str,
    provider: str = "anthropic", model: Optional[str] = None, max_tokens: int = 800,
) -> str:
    model = model or resolve_model("Claude")[1]
    client = _get_client(provider)
    if client is None:
        raise LLMUnavailable(f"no API key configured for provider '{provider}'")

    if provider == "anthropic":
        response = await client.messages.create(
            model=model, max_tokens=max_tokens, system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return "".join(b.text for b in response.content if b.type == "text")

    if provider == "gemini":
        response = await client.aio.models.generate_content(
            model=model, contents=f"{system_prompt}\n\n{user_prompt}")
        return response.text

    if provider == "openai":
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}])
        return response.choices[0].message.content

    raise LLMUnavailable(f"unknown provider '{provider}'")
