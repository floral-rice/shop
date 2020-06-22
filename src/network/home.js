import {request} from "./axios";

export function getMenuList() {
  return request({
    url: 'menus'
  })
}

