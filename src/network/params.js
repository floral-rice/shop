import {request} from "./axios";

//参数列表
export function getPamarm(info) {
  return request({
    url: `categories/${info.id}/attributes`,
    params: {
      sel: info.activeName
    }
  })
}
//添加动态参数或者静态属性
export function additionParams(info) {
  return request({
    method: 'post',
    url: `categories/${info.id}/attributes`,
    data: {
      attr_name: info.attr_name,
      attr_sel: info.attr_sel
    }
  })
}
// 根据 ID 查询参数
export function slectParam(info) {
  return request({
    url: `categories/${info.id}/attributes/${info.attrId}`,
    data: {
      attr_sel: info.attr_sel
    }
  })
}
//编辑提交参数
export function editParam(info) {
  return request({
    method: 'put',
    url: `categories/${info.id}/attributes/${info.attrId}`,
    data: {
      attr_name: info.attr_name,
      attr_sel: info.attr_sel,
      attr_vals: info.attr_vals
    }
  })
}
//删除参数
export function removeParmas(info) {
  return request({
    method: 'delete',
    url: `categories/${info.id}/attributes/${info.attrid}`
  })
}