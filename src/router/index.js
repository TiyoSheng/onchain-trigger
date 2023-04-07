// 导入router所需的方法
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
// 导入路由页面的配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

// 路由参数配置
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

// 导出默认值
export default router
