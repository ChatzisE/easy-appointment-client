import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false
import DatetimePicker from 'vuetify-datetime-picker'
 
Vue.use(DatetimePicker)
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
