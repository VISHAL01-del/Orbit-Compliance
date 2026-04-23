from pathlib import Path
import re

import streamlit as st
import streamlit.components.v1 as components


APP_DIR = Path(__file__).parent
DIST_DIR = APP_DIR / "dist"


def load_text_file(file_path: Path) -> str:
    return file_path.read_text(encoding="utf-8")


def inline_dist_app() -> str:
    index_path = DIST_DIR / "index.html"
    html = load_text_file(index_path)

    css_match = re.search(r'href="(/assets/[^"]+\.css)"', html)
    js_match = re.search(r'src="(/assets/[^"]+\.js)"', html)

    if not css_match or not js_match:
      raise FileNotFoundError("Missing built asset references in dist/index.html")

    css_path = DIST_DIR / css_match.group(1).lstrip("/")
    js_path = DIST_DIR / js_match.group(1).lstrip("/")

    css = load_text_file(css_path)
    js = load_text_file(js_path)

    mock_api_script = """
    <script>
      window.fetch = ((nativeFetch) => {
        const createResponse = (payload, status = 200) =>
          Promise.resolve(
            new Response(JSON.stringify(payload), {
              status,
              headers: { "Content-Type": "application/json" }
            })
          );

        const flagMap = {
          gdpr: [
            "Missing Data Encryption Clause",
            "Retention schedule not defined",
            "No DPA reference found"
          ],
          hipaa: [
            "Business Associate Agreement missing",
            "PHI access logging not documented",
            "Incident response workflow incomplete"
          ],
          soc2: [
            "Vendor risk review absent",
            "Logical access review not evidenced",
            "No backup restoration test record"
          ]
        };

        return async (input, init) => {
          const url = typeof input === "string" ? input : input?.url || "";

          if (url.endsWith("/api/health")) {
            return createResponse({ ok: true, service: "streamlit-mock-api" });
          }

          if (url.endsWith("/api/audit")) {
            const formData = init?.body;
            const regulation = (formData?.get("regulation") || "gdpr").toLowerCase();
            const file = formData?.get("file");
            const flags = flagMap[regulation] || flagMap.gdpr;

            await new Promise((resolve) => setTimeout(resolve, 1400));

            return createResponse({
              message: "Audit simulation completed in Streamlit demo mode.",
              report: {
                id: null,
                regulation,
                fileName: file?.name || "Uploaded file",
                fileSize: file?.size || 0,
                mimeType: file?.type || "application/octet-stream",
                storagePath: "streamlit-demo-upload",
                auditScore: Math.floor(Math.random() * 26) + 70,
                flags: flags.slice(0, 2 + Math.floor(Math.random() * 2))
              }
            });
          }

          return nativeFetch(input, init);
        };
      })(window.fetch.bind(window));
    </script>
    """

    boot_script = f"""
    <style>{css}</style>
    {mock_api_script}
    <div id="root"></div>
    <script type="module">{js}</script>
    """

    html = re.sub(r"<script[^>]*src=\"/assets/[^\"]+\.js\"[^>]*></script>", "", html)
    html = re.sub(r"<link[^>]*href=\"/assets/[^\"]+\.css\"[^>]*>", "", html)
    html = re.sub(r"<link[^>]*href=\"/favicon\.svg\"[^>]*>", "", html)
    html = re.sub(r"<div id=\"root\"></div>", "", html)
    html = html.replace("</body>", f"{boot_script}</body>")

    return html


st.set_page_config(page_title="Orbit Compliance", layout="wide")
st.title("Orbit Compliance")
st.caption("Streamlit Community Cloud deployment with embedded React build and mocked audit API.")

if not DIST_DIR.exists():
    st.error("Missing client/dist. Run `npm run build` inside `client` before deploying.")
else:
    try:
        app_html = inline_dist_app()
        components.html(app_html, height=980, scrolling=True)
    except Exception as error:
        st.exception(error)
