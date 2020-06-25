import {request} from "./axios"
//角色列表
export function getRoles() {
  return request({
    url: 'roles'
  })
}
//添加角色
export function addRoles(Info) {
  return request({
    method: 'post',
    url: 'roles',
    data: Info
  })
}
//根据 ID 查询角色
export function selectRoles(id) {
  return request({
    url: 'roles/' + id
  })
}
//编辑提交角色
export function editRoles(Info) {
  return request({
    method: 'put',
    url: 'roles/' + Info.roleId,
    data: {
      roleName: Info.roleName,
      roleDesc: Info.roleDesc
    }
  })
}
//删除角色
export function deleteRole(id) {
  return request({
    method: 'delete',
    url: 'roles/' + id
  })
}
//删除角色指定权限
export function removeRight(info) {
  return request({
    method: 'delete',
    url: `roles/${info.roleId}/rights/${info.rightId}`
  })
}
//角色授权
export function setRight(Info) {
  return request({
    method: 'post',
    url: `roles/${Info.roleId}/rights`,
    data: {
      rids: Info.rids
    }
  })
}
