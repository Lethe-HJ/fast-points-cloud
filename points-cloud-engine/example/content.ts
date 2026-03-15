import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { DemoInfo } from "./layout";

@customElement("demo-content")
export class DemoContent extends LitElement {
  @property({ type: String }) demoId = "demo1";
  @property({ attribute: false }) demoInfo: DemoInfo | null = null;
  @state() private loading = true;
  @state() private error: string | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .demo-container {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }

    .demo-card {
      flex: 1;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .demo-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #333;
    }

    .iframe-container {
      width: 100%;
      height: 300px;
      max-width: 600px;
      max-height: 300px;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
    }

    iframe {
      width: 100%;
      height: 100%;
      max-width: 600px;
      max-height: 300px;
      border: none;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #666;
      font-size: 16px;
    }

    .error {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #ff4444;
      font-size: 16px;
      background: #ffebee;
      border-radius: 4px;
    }

    /* 竖屏时上下排列 */
    @media (orientation: portrait) {
      .demo-container {
        flex-direction: column;
      }
      .demo-card {
        width: 100%;
      }
      .iframe-container {
        max-width: 100%;
      }
      iframe {
        max-width: 100%;
      }
    }

    /* 小屏幕时也上下排列 */
    @media (max-width: 768px) {
      .demo-container {
        flex-direction: column;
      }
      .demo-card {
        width: 100%;
      }
      .iframe-container {
        max-width: 100%;
      }
      iframe {
        max-width: 100%;
      }
    }
  `;

  protected updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("demoInfo")) {
      this.loading = false;
      this.error = null;
    }
  }

  private generateIframeHtml(scriptPath: string, canvasId: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <canvas id="${canvasId}"></canvas>
  <script type="module" src="${scriptPath}"><\/script>
</body>
</html>`;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="demo-container">
          <div class="demo-card">
            <div class="demo-title">WebGL Implementation</div>
            <div class="loading">Loading...</div>
          </div>
          <div class="demo-card">
            <div class="demo-title">Three.js Standard</div>
            <div class="loading">Loading...</div>
          </div>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="demo-container">
          <div class="demo-card">
            <div class="demo-title">WebGL Implementation</div>
            <div class="error">${this.error}</div>
          </div>
          <div class="demo-card">
            <div class="demo-title">Three.js Standard</div>
            <div class="error">${this.error}</div>
          </div>
        </div>
      `;
    }

    if (!this.demoInfo) {
      return html`
        <div class="demo-container">
          <div class="demo-card">
            <div class="demo-title">WebGL Implementation</div>
            <div class="error">No demo info loaded</div>
          </div>
          <div class="demo-card">
            <div class="demo-title">Three.js Standard</div>
            <div class="error">No demo info loaded</div>
          </div>
        </div>
      `;
    }

    const engineHtml = this.generateIframeHtml(
      `./${this.demoId}/${this.demoInfo.webglFile}`,
      "canvas1"
    );
    const threejsHtml = this.generateIframeHtml(
      `./${this.demoId}/${this.demoInfo.threejsFile}`,
      "canvas2"
    );

    return html`
      <div class="demo-container">
        <div class="demo-card">
          <div class="demo-title">WebGL Implementation</div>
          <div class="iframe-container">
            <iframe .srcdoc="${engineHtml}" title="WebGL Implementation"></iframe>
          </div>
        </div>
        <div class="demo-card">
          <div class="demo-title">Three.js Standard</div>
          <div class="iframe-container">
            <iframe .srcdoc="${threejsHtml}" title="Three.js Standard"></iframe>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-content": DemoContent;
  }
}
