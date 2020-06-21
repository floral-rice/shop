import axios from 'axios'

export function request(config) {
  //1.创建axios并配置基础配置
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8888/api/private/v1/'
  })
  //2.请求拦截，获得token的情况下，在请求头中增加token
  instance.interceptors.request.use(res => {
    res.headers.Authorization = window.sessionStorage.getItem('token')
    return res
  })
  //3.响应拦截
  instance.interceptors.response.use(res => {
    return res.data
  }, err => {})
  //4.使用instance
  return instance(config)
}