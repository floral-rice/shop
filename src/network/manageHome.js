import {request} from "./axios";

export function getMenuList() {
  return request({
    url: 'menus'
  })
}

//子组件users
// 获取用户列表
export function getUserList(queryInfo) {
  return request({
    url: 'users',
    params: queryInfo
  })
}
export function putState(uId, type) {
  return request({
    method: 'put',
    url: `users/${uId}/state/${type}`
  })
}