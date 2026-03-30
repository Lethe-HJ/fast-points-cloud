import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./content";
import { demoShellManifest, demos } from "./config";

const LAST_DEMO_KEY = "last-demo-id";

/** 同一 demo 下的一项小实验（iframe 入口脚本） */
export interface DemoExperiment {
  /** 在同一 {@link DemoInfo} 内唯一，用于下拉与缓存 key */
  id: string;
  title: string;
  /** 写 `() => import("./xxx")`，供 Vite 打包；勿在父页调用 */
  file: () => Promise<unknown>;
  /** iframe 内 &lt;script type="module"&gt; 的 src（由 `finalizeExperiments` 填充） */
  scriptSrc: string;
  /** 当前小实验入口 .ts 在 GitHub 上的 blob 链接 */
  githubUrl: string;
}

export interface DemoInfo {
  id: string;
  name: string;
  description: string;
  showInMenu: boolean;
  /** 至少一项；多项时卡片右上角以下拉切换 */
  experiments: DemoExperiment[];
}

function shellToPlaceholderDemoItems(): DemoInfo[] {
  return demoShellManifest
    .filter((e) => e.showInMenu)
    .map((e) => ({ ...e, experiments: [] }));
}

@customElement("demo-layout")
export class DemoLayout extends LitElement {
  @property({ type: String }) activeId =
    localStorage.getItem(LAST_DEMO_KEY) ?? "demo1";
  @state() private demoItems: DemoInfo[] = shellToPlaceholderDemoItems();
  @state() private demosLoading = true;
  private loadStarted = false;

  static styles = css`
    :host {
      display: flex;
      height: 100vh;
      min-height: 0;
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
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
      padding: 20px;
      overflow: hidden;
    }
    .content > demo-content {
      flex: 1 1 0;
      min-height: 0;
      min-width: 0;
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
      color: #fff;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    if (this.loadStarted) return;
    this.loadStarted = true;
    void this.loadDemoInfo();
  }

  private async loadDemoInfo() {
    this.demosLoading = true;
    const results = await Promise.all(
      demos.map(async (demoId) => {
        try {
          const { demoInfo } = await import(`./${demoId}/index.ts`);
          return demoInfo.showInMenu ? demoInfo : null;
        } catch (error) {
          console.warn(`Failed to load demo ${demoId}:`, error);
          return null;
        }
      }),
    );
    const demoInfos = results.filter((x): x is DemoInfo => x != null);
    this.demoItems = demoInfos;
    this.demosLoading = false;
    if (
      demoInfos.length > 0 &&
      !demoInfos.find((item) => item.id === this.activeId)
    ) {
      this.activeId = demoInfos[0].id;
    }
  }

  private handleNavClick(item: DemoInfo) {
    this.activeId = item.id;
    localStorage.setItem(LAST_DEMO_KEY, item.id);
  }

  render() {
    const activeItem = this.demoItems.find((item) => item.id === this.activeId);
    return html`
      <div class="sidebar">
        <h2>Demos</h2>
        ${this.demoItems.map(
          (item) =>
            html`<div
              class="nav-item ${this.activeId === item.id ? "active" : ""}"
              @click=${() => this.handleNavClick(item)}
            >
              ${item.name}
            </div>`,
        )}
      </div>
      <div class="content">
        <h1>mini-three - ${activeItem?.name}</h1>
        ${activeItem ? html`<p>${activeItem.description}</p>` : html``}
        <demo-content
          .demoId=${this.activeId}
          .demoInfo=${activeItem}
          .demosLoading=${this.demosLoading}
        ></demo-content>
      </div>
    `;
  }
}
