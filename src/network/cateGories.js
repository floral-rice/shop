import {request} from "./axios";

//商品分类数据列表
export function getCateGory(info) {
  return request({
    url: 'categories',
    params: info
  })
}
//添加分类
export function additionCate(info) {
  return request({
    method: 'post',
    url: 'categories',
    data: info
  })
}
//编辑提交分类
export function editCate(info) {
  return request({
    method: 'put',
    url: 'categories/' + info.id,
    data: {
      cat_name: info.cat_name
    }
  })
}
//删除分类
export function removeCate(id) {
  return request({
    method: 'delete',
    url: 'categories/' + id
  })
}