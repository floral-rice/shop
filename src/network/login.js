import {request} from './axios'

export function getLogin(loginForm) {
  return request({
    method: 'post',
    url: 'login',
    data: {
      username: loginForm.userName,
      password: loginForm.userPassWord
    }
  })
}