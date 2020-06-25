import {request} from "./axios"

//所有权限列表
export function getrights(type) {
  return request({
    url: 'rights/' + type
  })
}