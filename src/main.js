
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import router from './router/router.js';
import { createPinia } from 'pinia'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
const app = createApp(App)
const pinia = createPinia();
const script = document.createElement('script');
script.async = true;
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-7X7S78DN4M';
document.head.appendChild(script);
script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-7X7S78DN4M');
  };
app.use(router)
app.component('VueDatePicker', VueDatePicker);
app.use(pinia);
app.mount('#app')

/* // Verifica si la página está cargando sobre HTTP, y si es así, redirige automáticamente a HTTPS.
if (window.location.protocol === "http:") {
  window.location.href = "https://" + window.location.hostname + window.location.pathname + window.location.search;
}
*/
