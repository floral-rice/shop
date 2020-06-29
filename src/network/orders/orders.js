import {request} from "../axios";

// 请求订单数据列表
export function getOrdersList(info) {
  return request({
    url: 'orders',
    params: info
  })
}
// 查看物流信息
export function slectLogistics() {
  return request({
    method: 'get',
    url: '/kuaidi/804909574412544580'
  })
}