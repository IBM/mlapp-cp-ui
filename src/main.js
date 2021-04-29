import Vue from 'vue'
import vuetify from './plugins/vuetify' 
import App from './App.vue'
import store from './store'
import router from './router'
import axios from 'axios'
import global_config from './../config'

Vue.use(require('vue-moment'));

Vue.config.productionTip = false
axios.defaults.withCredentials = true;
axios.defaults.baseURL = global_config['api']['base_url']

axios.interceptors.request.use(
  config => {
    config.headers.authorization = localStorage['auth-token'];
    return config;
  },
  error => Promise.reject(error)
);

axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data

  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  console.error(error);
  if (error.response.status == 401) {
    // active directory login
    if (global_config['login_type'] == "w3"){
      localStorage.removeItem("logged-in");
      router.push({name: 'w3-login'})
    }
    // basic login
    else {
      localStorage.removeItem("auth-token");
      router.push({name: 'login'})     
    }
  }
  return error.response;
});

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
