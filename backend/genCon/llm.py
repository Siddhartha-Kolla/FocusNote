# llm.py  (oder an passende Stelle einfügen)
import json
import requests
from typing import Any, Dict, List, Union, Tuple
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class HackAPI:
    @staticmethod
    def extract_text_from_response(resp_json: Any) -> Tuple[str, str]:
        """
        Akzeptiert dict oder JSON-string; extrahiert assistant-thought und response
        Split: '<think>...</think>' und danach der eigentliche assistant-response mit '</think>'
        Gibt (assistant_think, assistant_response)
        """
        content = ""
        # Parse string JSON falls nötig
        if isinstance(resp_json, str):
            try:
                parsed = json.loads(resp_json)
            except Exception:
                parsed = None
                content = resp_json
        else:
            parsed = resp_json

        if isinstance(parsed, dict):
            # verschiedene mögliche shapes handhaben
            choices = parsed.get("choices") or parsed.get("outputs") or []
            if choices and isinstance(choices, list):
                first = choices[0]
                if isinstance(first, dict):
                    # Chat-style: message -> content
                    msg = first.get("message") or first.get("delta") or first
                    if isinstance(msg, dict):
                        content = msg.get("content") or msg.get("text") or ""
                    else:
                        content = str(msg)
                else:
                    content = str(first)
            else:
                # fallback top-level keys
                content = parsed.get("text") or parsed.get("response") or parsed.get("output") or content or ""
        # else: content wurde ggf. schon aus raw string gesetzt

        if content is None:
            content = ""

        parts = content.split("</think>")
        assistant_part = parts[0].replace("<think>", "").strip() if parts and parts[0] else ""
        response_part = parts[1].strip() if len(parts) > 1 else ""
        return assistant_part, response_part

    @staticmethod
    def get_text_from_hackai(
        prompt: str = "Do nothing",
        info: Union[str, List[Dict[str, Any]], Dict[str, Any], Any] = "Nothing",
        *,
        max_info_chars: int = 2000,
        strip_html_flag: bool = True,
        timeout_connect: float = 5.0,
        timeout_read: float = 20.0,
        retries: int = 3,
        backoff_factor: float = 1.0
    ) -> str:
        """
        Robuste Anfrage an HackClub AI (chat/completions endpoint).
        Liefert die assistant-response (Text nach </think>) oder eine Fehlermeldung als String.
        """
        # kleines helper: build info text (vereinfachte Version)
        def _build_info(info_obj):
            try:
                if not isinstance(info_obj, (str, list, dict)) and hasattr(info_obj, "search"):
                    try:
                        return info_obj.search(prompt)
                    except TypeError:
                        return info_obj.search()
                if isinstance(info_obj, (list, dict)):
                    # einfache serialisierung
                    return json.dumps(info_obj, ensure_ascii=False)[:max_info_chars]
                return str(info_obj)[:max_info_chars]
            except Exception:
                return str(info_obj)[:max_info_chars]

        info_str = _build_info(info)

        user_content = (
            prompt.rstrip() + "\n\n"
            "To answer this prompt, the following info is provided:\n\n"
            + info_str
        )

        payload = {
            "messages": [
                {"role": "user", "content": user_content},
                {"role": "system", "content": "You are a helpful assistant and answer in the language of the question"},
            ]
        }

        # Session mit Retry
        session = requests.Session()
        retry_strategy = Retry(
            total=retries,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["POST"],
            backoff_factor=backoff_factor,
            raise_on_status=False
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        session.mount("http://", adapter)

        try:
            resp = session.post(
                "https://ai.hackclub.com/chat/completions",
                json=payload,
                timeout=(timeout_connect, timeout_read)
            )
            resp.raise_for_status()
            json_resp = resp.json()
            _, response_text = HackAPI.extract_text_from_response(json_resp)
            return response_text
        except requests.exceptions.Timeout as e:
            return f"[error] Request timed out (connect {timeout_connect}s / read {timeout_read}s): {e}"
        except requests.exceptions.ConnectionError as e:
            return f"[error] Connection error: {e}. Check network/proxy/firewall."
        except requests.exceptions.HTTPError as e:
            body = ""
            try:
                body = resp.text[:500]
            except Exception:
                pass
            return f"[error] HTTP error: {e}. Body: {body}"
        except Exception as e:
            return f"[error] Unexpected error during request: {e}"
