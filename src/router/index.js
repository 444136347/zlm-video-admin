import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Layout from '@/layout/indexPage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/indexPage.vue'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/NotFound.vue'),
    hidden: true
  },
  {
    path: '/',
    name: 'home',
    component: Layout,
    redirect: '/dashboard'
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter  = () => new VueRouter({
  scrollBehavior: () => ({ y: 0 }),
  routes
})


const router = createRouter();

// 解决菜单重复点击报错问题
const originalPush = VueRouter.prototype.push

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

// 解决addRoute重复添加
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}


export default router
