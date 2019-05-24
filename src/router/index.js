import Vue from 'vue'
import Router from 'vue-router'
// bootstrap-vue
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
// font-awesome
import '@fortawesome/fontawesome-free/css/all.css'

// 載入元件ChatRoom
// import ChatRoom from '@/components/ChatRoom'
import LoginPage from '@/components/LoginPage'
import ChatRoom from '@/components/ChatRoom'
import Register from '@/components/Register'

Vue.use(BootstrapVue)
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LoginPage',
      component: LoginPage
    },
    {
      // 路徑用於網址列
      path: '/chatRoom',
      // name用於設定連結，例如樣板中可用下列方式來寫連結，就不用寫<a>掛path了
      // <router-link :to="{ name: 'ChatRoom' }">ChatRoom Page</router-link>
      name: 'ChatRoom',
      // 到這個ChatRoom(/)時，使用ChatRoom元件
      component: ChatRoom
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    }
  ]
})
