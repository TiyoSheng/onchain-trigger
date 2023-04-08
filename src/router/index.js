// 导入router所需的方法
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Playground from '../views/Playground.vue'
// 导入路由页面的配置
const routes = [{
  path: '/:id?',
  name: 'Home',
  component: Home
}, {
  path: '/login',
  name: 'Login',
  component: Login
}, {
  path: '/regist',
  name: 'Register',
  component: Register
}, {
  path: '/playground',
  name: 'Playground',
  component: Playground
}]

// 路由参数配置
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

// 导出默认值
export default router
