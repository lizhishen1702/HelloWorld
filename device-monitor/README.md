# 设备监控 - 上电时间轴

Vue3 设备监控前端，展示设备上电/下电时间轴，支持按设备类型筛选和时间范围选择。

## 功能

- **设备列表**：下拉选择设备类型（机器人、传感器等）
- **时间范围**：1天、2天、3天、5天、7天
- **时间轴图表**：条形图展示每个设备的上下电时间段
- **颜色规则**：
  - 橘黄色：运行时长 < 1 小时
  - 蓝色：运行时长 1～12 小时
  - 绿色：运行时长 > 12 小时

## CSV 数据格式

每个设备对应一个 CSV 文件，需包含以下列：
- `boot_str`：上电时间，格式 `YYYY/M/D HH:MM` 或 `YYYY-MM-DD HH:MM`
- `shutdown_str`：下电时间，格式同上

示例：
```csv
boot_s,heartbeat,shutdown,boot_str,heartbeat_str,shutdown_str
,,,2026/3/7 08:00,,2026/3/7 10:00
,,,2026/3/7 14:00,,2026/3/7 18:30
```

## 配置设备

在 `src/utils/deviceConfig.js` 中配置设备类型和 CSV 路径：

```js
export const deviceConfig = {
  机器人: [
    { id: '机器人1', csvPath: '/data/robot_1.csv' },
    { id: '机器人2', csvPath: '/data/robot_2.csv' },
  ],
  // 可添加更多设备类型...
}
```

CSV 文件需放置在 `public/data/` 目录下。

## 运行

```bash
npm install
npm run dev
```

构建：
```bash
npm run build
```
