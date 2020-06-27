import {request} from "../axios";

// 获取用户列表
export function getUserList(queryInfo) {
  return request({
    url: 'users',
    params: queryInfo
  })
}
// 修改用户状态
export function putState(uId, type) {
  return request({
    method: 'put',
    url: `users/${uId}/state/${type}`
  })
}
//添加用户
export function addAUser(addForm) {
  return request({
    method: 'post',
    url: 'users',
    data: addForm
    // data: {
    //   username: addForm.username,
    //   password: addForm.password,
    //   email: addForm.email,
    //   mobile: addForm.mobile
    // }
  })
}
//根据 ID 查询用户信息
export function selectUser(id) {
  return request({
    url: 'users/' + id
  })
}
//编辑用户提交
export function putUser(editForm) {
  return request({
    method: 'put',
    url: 'users/' + editForm.id,
    data: {
      email: editForm.email,
      mobile: editForm.mobile
    }
  })
}
//删除单个用户
export function deleteUser(id) {
  return request({
    method: 'delete',
    url: 'users/' + id
  })
}
// 分配用户角色
export function setRole(info) {
  return request({
    method: 'put',
    url: `users/${info.id}/role`,
    data: {
      rid: info.rid
    }
  })
}
