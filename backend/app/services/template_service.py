from pathlib import Path

TEMPLATES_DIR = Path("app/templates/emails")

def render_template(template_name: str, context: dict) -> str:
    html = (TEMPLATES_DIR / template_name).read_text(encoding="utf-8")

    for key, value in context.items():
        html = html.replace(f"{{{{ {key} }}}}", str(value))

    return html
