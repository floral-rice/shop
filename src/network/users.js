import {request} from "./axios";

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