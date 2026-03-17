/**
 * 设备类型配置
 * key: 设备类型显示名称, value: 设备列表及对应的CSV路径
 */
export const deviceConfig = {
  机器人: [
    { id: '机器人1', csvPath: '/data/robot_1.csv' },
    { id: '机器人2', csvPath: '/data/robot_2.csv' },
    { id: '机器人3', csvPath: '/data/robot_3.csv' }
  ],
  传感器: [
    { id: '传感器1', csvPath: '/data/sensor_1.csv' },
    { id: '传感器2', csvPath: '/data/sensor_2.csv' }
  ]
}

export const timeRangeOptions = [
  { label: '1天', value: 1 },
  { label: '2天', value: 2 },
  { label: '3天', value: 3 },
  { label: '5天', value: 5 },
  { label: '7天', value: 7 },
  { label: '15天', value: 15 },
  { label: '30天', value: 30 }
]
