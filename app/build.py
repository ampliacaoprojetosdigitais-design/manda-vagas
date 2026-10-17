"""Gera dist/index.html (arquivo único) a partir de src/."""
import pathlib
here = pathlib.Path(__file__).parent
src = here / "src"
css = (src / "styles.css").read_text(encoding="utf-8")
js = "\n".join((src / f).read_text(encoding="utf-8") for f in sorted(p.name for p in src.glob("*.js")))
head = """<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Manda Vaga</title>
<meta name="description" content="Manda Vaga — currículo, curadoria de vagas e acompanhamento de candidaturas.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap">
"""
page = f"""{head}<style>
{css}
</style></head><body>
<div id="app" aria-live="polite"><div class="empty"><b>Carregando o Manda Vaga…</b></div></div>
<div class="toasts" id="toasts"></div>
<script>
{js}
</script>
</body></html>
"""
out = here / "dist" / "index.html"; out.parent.mkdir(exist_ok=True); out.write_text(page, encoding="utf-8")
print("Gerado:", out, len(page), "bytes")
