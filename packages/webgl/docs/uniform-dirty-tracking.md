# Uniform 脏标记：减少 `gl.uniform*` 调用

本文说明以 `PointLight` 为例的「按 ShaderProgram 分桶 + 脏标记」策略，可迁移到任意需要**按 program 缓存 uniform 上传**的对象（Camera、Material、其他 Light 等）。

## 目标

- `gl.uniform*` 与 `getUniformLocation`（经缓存后）仍有成本；同一光源可能对**多个** `ShaderProgram` 各上传一次。
- 仅在「CPU 侧值相对该 program 上次上传有变化」或「尚未对该 program 同步过」时上传。

## 数据结构

| 概念 | 作用 |
|------|------|
| `needUpdateMap: Map<ShaderProgram, NeedUpdate>` | 每个 **program 一份**脏标记；切换 program 后 GPU 上的 uniform 是另一套，必须分别记状态。 |
| `NeedUpdate` 字段 | 按语义拆分（如 `position` / `color` / `intensity` / `attenuation`），只重传变化的分组。 |
| `_orphan*Dirty`（孤儿脏标记） | 在**还没有任何 `ShaderProgram` 进入 `needUpdateMap`** 时，属性已被修改；无法对 map 里各 program 打标，先记在「全局孤儿」上。 |

## 何时把孤儿并入某个 program

`getNeedUpdateFor(sp)` 首次为某个 `sp` 建表项时：

- 用当前各 `_orphan*Dirty` 初始化该 program 的 `NeedUpdate`；
- 随后将孤儿标记**全部清为 false**（已并入本条目）。

之后该 program 的增量状态只存在 `needUpdateMap.get(sp)` 里。

## 属性变更：`mark*Dirty`

某属性变化时：

1. 置对应 `_orphan*Dirty = true`（覆盖尚未登记过的 program）；
2. 对 `needUpdateMap` 里**已有**的每个 `NeedUpdate`，把该属性字段置 `true`。

这样无论 program 是否已出现，都能在下一次 `attach` 时看到脏状态。

## 新 program：订阅 `ShaderProgram.onProgramActivated`

在首次需要时注册（仅一次）`ShaderProgram.onProgramActivated(gl, listener)`：

- 当上下文**真正切换**到另一个 program（`useProgram` 且与上次不同）时回调；
- 若回调里的 `sp` 还**不在** `needUpdateMap` 中，则插入一条**全量脏**（各字段 `true`），保证首次在该 program 下绘制前会完整上传。
- **已在 map 中的 `sp` 不会在回调里再次打标**（切换回已用过的 program 时，若未 `mark*Dirty` 则跳过上传，与 GPU 上仍保留上次写入一致）。

`Material` 仅在 `sp` 为本材质缓存的 `ShaderProgram` 时写入 map；子类（如 `MeshPhongMaterial`）可重写 `onProgramActivatedForUniforms` 同步扩展 map。

这与「按 program 分桶」一致：首次见到某 program 时补一次全量同步机会。

## 上传路径：`attach`

1. `getNeedUpdateFor(sp)` 取得当前 program 的 `NeedUpdate`；
2. 仅当某字段为 `true` 时调用对应的 `gl.uniform*`，成功上传后置 `false`；
3. 可合并相关 uniform（如本例中 `needAtten = nu.attenuation || nu.intensity`）避免重复分支逻辑。

## 帧末：`clearUniformNeedUpdate`

`WebGLRenderer` 在每帧所有绘制结束后调用：

- `camera.clearUniformNeedUpdate()`；
- 场景里带 `clearUniformNeedUpdate` 的对象（如 Light）；
- 本帧出现过的 **Material** 去重后各调用一次。

作用：把各对象 `needUpdateMap` 里**所有 program** 的脏标记统一清为 `false`（不限于本帧绑过的 program）。

约定：**本帧渲染路径已把应写入 GPU 的 uniform 写完**；帧末清零表示「与当前 CPU 状态对齐」，下一帧若未再 `mark*Dirty`，则不再上传。

## 迁移检查清单

1. **按 bucket 分状态**（此处为 `ShaderProgram`）：不同 GL program 不能共用一份「已上传」记忆。
2. **孤儿标记**：解决「先改属性、后出现 program」的顺序问题。
3. **`mark*Dirty`**：孤儿 + 已有 bucket 全部打标。
4. **新 bucket**：`onProgramActivated`（仅 `!needUpdateMap.has(sp)` 时插入全脏）或首次 `getNeedUpdateFor` 时「孤儿合并」。
5. **`attach` 里只上传脏字段**，上传后清字段。
6. **帧末统一 `clearUniformNeedUpdate`**（若采用与本项目相同的跨帧策略），与 Renderer 约定一致。

按上述模式即可在其它资源类上复用同一套「少调 uniform」的框架，仅替换 `NeedUpdate` 的字段划分与 `attach` 内的具体 uniform 名即可。
