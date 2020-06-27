import {request} from "../axios";

//商品列表数据
export function getGoodsList(info) {
  return request({
    url: 'goods',
    params: info
  })
}
//删除商品
export function removeGoods(id) {
  return request({
    method: 'delete',
    url: 'goods/' + id
  })
}
//添加商品
export function addGoods(info) {
  return request({
    method: 'post',
    url: 'goods',
    data: info
  })
}
//根据 ID 查询商品
export function queryGoodById(id) {
  return request({
    url: 'goods/' + id
  })
}
// 编辑提交商品
export function editCommit(info) {
  return request({
    method: 'put',
    url: 'goods/' + info.id,
    data: {
      goods_name: info.goods_name,
      goods_price: info.goods_price,
      goods_number: info.goods_number,
      goods_weight: info.goods_weight,
      goods_introduce: info.goods_introduce,
      pics: info.pics,
      attrs: info.attrs
    }
  })
}