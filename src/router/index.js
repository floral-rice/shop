import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const Login = () => import('views/Login/Login')
const  ManageHome = () => import('views/ManageHome/ManageHome')
const MUser = () => import('views/ManageHome/childrencpn/MUser')
const Users = () => import('views/ManageHome/childrencpn/Users')
  const routes = [
    {
      path: '',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/managehome',
      component: ManageHome,
      redirect: '/muser',
      children: [
        {
          path: '/muser',
          component: MUser
        },
        {
          path: '/users',
          component: Users
        }
      ]
    }
]

const router = new VueRouter({
  routes
})

//路由的全局守卫
router.beforeEach((to, from, next) => {
  // 1.to是指将要访问的路由路径
  // 2.from是指从哪个路径跳转
  // 3.next是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转
  //表示如果要跳转到'/login'的登录界面直接return next()放行
  if (to.path === '/login') return next()
  // 如果不是的话则先获取token,没有token则强制跳转到login界面
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
