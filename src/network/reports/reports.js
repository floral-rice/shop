import {request} from "../axios";

// 基于时间统计的折线图
export function getChart() {
  return request({
    url: 'reports/type/1'
  })
}