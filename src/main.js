import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import qs from 'qs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import '../src/assets/icon-font/iconfont.css'
import '../src/assets/css/base-pc.css'
import '../src/assets/css/reset.css'
import '../src/assets/css/element.css'
import '../src/assets/css/zwj-ele.css'
import '../src/assets/css/jpp-ele.css'
import '../src/assets/css/jc-ele.css'
import '../src/assets/css/common.css'
import 'jquery'
import 'babel-polyfill'
// axios 配置
// axios.defaults.withCredentials = true;
var $axios = axios.create({
    baseURL: 'http://suneee.dcp.weilian.cn/sunEee-user',
    // baseURL: 'http://172.19.21.66/sunEee-user',
    // baseURL: '/api',
    // timeout: 5000,
    headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    }
});

//POST传参序列化
$axios.interceptors.request.use((config) => {
    if (config.method === 'post') {
        config.data = qs.stringify(config.data);
    }
    return config;
}, (error) => {
    _.toast("错误的传参", 'fail');
    return Promise.reject(error);
});
$axios.interceptors.response.use((res) => {
    if (res.data.code === 2) {
        router.push('/')
    }
    return res;
}, (error) => {

    return Promise.reject(error);
});
$axios.defaults.withCredentials = true;
Vue.use(ElementUI);
Vue.prototype.axios = $axios;
Vue.config.productionTip = false;

new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
})