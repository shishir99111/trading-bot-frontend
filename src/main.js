import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import {
  routers,
  otherRouter,
  appRouter
} from './router';
import Vuex from 'vuex';
import Util from './libs/util';
import App from './app.vue';
import Cookies from 'js-cookie';
import 'iview/dist/styles/iview.css';
import { store } from './vuex'

import VueI18n from 'vue-i18n';
import Locales from './locale';
import enLocale from 'iview/src/locale/lang/en-US';

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueI18n);
Vue.use(iView);

// Automatically set the language
// currently default set to 'en-US'
const navLang = navigator.language;
const localLang = (navLang === 'en-GB') ? navLang : false;
const lang = 'en-US';
// window.localStorage.lang || localLang;

Vue.config.lang = lang;

// Multilingual configuration
const locales = Locales;
const mergeEN = Object.assign(enLocale, locales['en-US']);
Vue.locale('en-US', mergeEN);

// Routing configuration
const RouterConfig = {
  mode: 'history',
  routes: routers
};

const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  Util.title(to.meta.title);
  if (Cookies.get('locking') === '1' && to.name !== 'locking') { // Judge whether the current lock state
    next(false);
    router.replace({
      name: 'locking'
    });
  } else if (Cookies.get('locking') === '0' && to.name === 'locking') {
    next(false);
  } else {
    if (!Cookies.get('token') && to.name !== 'login') { // Determine if you have not logged in and the page you are visiting is not a login page
      next({
        name: 'login'
      });
    } else if (Cookies.get('token') && to.name === 'login') { // Determine if you are logged in and go to the login page
      Util.title();
      next({
        name: 'home_index'
      });
    } else {
      const routeObj = Util.getRouterObjByName([otherRouter, ...appRouter], to.name);
      if (routeObj && routeObj.access !== undefined) { // Determine whether the user has permission of accessing route exist or not.
        if (routeObj.access === parseInt(Cookies.get('access'))) {
          Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next); // If you enter in the address bar is a menu is the default to open the page of the first two menu
        } else {
          router.replace({
            name: 'error_401'
          });
          next();
        }
      } else {
        Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next);
      }
    }
  }
  iView.LoadingBar.finish();
});

router.afterEach(() => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});

new Vue({
  el: '#app',
  router: router,
  store: store,
  render: h => h(App),
  data: {
    currentPageName: ''
  },
  mounted() {
    this.currentPageName = this.$route.name;
    this.$store.commit('initCachepage');
    // Permission menu filtering related
    this.$store.commit('updateMenulist');
    // Full screen related
    document.addEventListener('fullscreenchange', () => {
      this.$store.commit('changeFullScreenState');
    });
    document.addEventListener('mozfullscreenchange', () => {
      this.$store.commit('changeFullScreenState');
    });
    document.addEventListener('webkitfullscreenchange', () => {
      this.$store.commit('changeFullScreenState');
    });
    document.addEventListener('msfullscreenchange', () => {
      this.$store.commit('changeFullScreenState');
    });
  },
  created() {
    let tagsList = [];
    appRouter.map((item) => {
      if (item.children.length <= 1) {
        tagsList.push(item.children[0]);
      } else {
        tagsList.push(...item.children);
      }
    });
    this.$store.commit('setTagsList', tagsList);
    this.$store.dispatch('getUserDetails', {}).then((res) => {
      if (!res.success) {
        this.$router.push({
          name: 'login'
        });
      }
    });
  }
});