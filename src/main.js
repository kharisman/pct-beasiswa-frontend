// import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'


import Index from '@/pages/Index.vue'

const routes = [
    { path: '/', component: Index},
];
  
const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App)
app.use(router);
app.mount('#app')
