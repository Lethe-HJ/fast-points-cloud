import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./content";
import { demos } from "./config";

export interface DemoInfo {
  id: string;
  name: string;
  description: string;
  showInMenu: boolean;
  webglFile: string;
  threejsFile: string;
  init: () => Promise<void>;
}

@customElement("demo-layout")
export class DemoLayout extends LitElement {
  @property({ type: String }) activeId = "demo1";
  @state() private demoItems: DemoInfo[] = [];

  static styles = css`
    :host {
      display: flex;
      height: 100vh;
      font-family: Arial, sans-serif;
    }

    .sidebar {
      width: 200px;
      background: #f0f0f0;
      padding: 20px;
      border-right: 1px solid #ddd;
      overflow-y: auto;
    }

    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .nav-item {
      padding: 10px;
      margin: 5px 0;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .nav-item:hover {
      background: #e0e0e0;
    }

    .nav-item.active {
      background: #007bff;
      color: white;
    }

    .loading {
      padding: 20px;
      color: #666;
    }
  `;

  private async loadDemoInfo() {
    try {
      // 动态导入 demo 信息
      const demoInfos: DemoInfo[] = [];

      for (const demoId of demos) {
        try {
          const { demoInfo } = await import(`./${demoId}/index.ts`);
          if (demoInfo.showInMenu) {
            demoInfos.push(demoInfo);
          }
        } catch (error) {
          console.warn(`Failed to load demo ${demoId}:`, error);
        }
      }

      this.demoItems = demoInfos;

      // 如果当前 activeId 不在 demoItems 中，选择第一个
      if (
        demoInfos.length > 0 &&
        !demoInfos.find((item) => item.id === this.activeId)
      ) {
        this.activeId = demoInfos[0].id;
      }
    } catch (error) {
      console.error("Error loading demo info:", error);
    }
  }

  private handleNavClick(item: DemoInfo) {
    this.activeId = item.id;
  }

  protected firstUpdated() {
    this.loadDemoInfo();
  }

  render() {
    const activeItem = this.demoItems.find((item) => item.id === this.activeId);

    if (this.demoItems.length === 0) {
      return html`
        <div class="sidebar">
          <h2>Demos</h2>
          <div class="loading">Loading demos...</div>
        </div>
        <div class="content">
          <h1>Points Cloud Engine</h1>
          <div class="loading">Loading content...</div>
        </div>
      `;
    }

    return html`
      <div class="sidebar">
        <h2>Demos</h2>
        ${this.demoItems.map(
          (item) => html`
            <div
              class="nav-item ${this.activeId === item.id ? "active" : ""}"
              @click=${() => this.handleNavClick(item)}
            >
              ${item.name}
            </div>
          `,
        )}
      </div>
      <div class="content">
        <h1>Points Cloud Engine - ${activeItem?.name}</h1>
        ${activeItem ? html`<p>${activeItem.description}</p>` : html``}
        <demo-content
          .demoId=${this.activeId}
          .demoInfo=${activeItem}
        ></demo-content>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-layout": DemoLayout;
  }
}
