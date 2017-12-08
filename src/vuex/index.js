import Vue from 'vue';
import Vuex from 'vuex';
import Util from '../libs/util';
import {
  otherRouter,
  appRouter
} from '../router';
import Cookies from 'js-cookie';
import appService from '../services/app.service';

Vue.use(Vuex);

const state = {
  routers: [
    otherRouter,
    ...appRouter
  ],
  menuList: [],
  tagsList: [...otherRouter.children],
  pageOpenedList: [{
    title: 'Home',
    path: '',
    name: 'home_index'
  }],
  currentPageName: '',
  currentPath: [{
    title: 'Home',
    path: '',
    name: 'home_index'
  }], // Breadcrumbs array
  openedSubmenuArr: [], // An array of menus to expand on
  menuTheme: '', // theme
  theme: '',
  cachePage: [],
  lang: '',
  isFullScreen: false,
  dontCache: [], // Define the name attribute of the page you do not want to cache here (see Routing Configuration Router.js)
  user: {},
};

const getters = {
  isAuthenticated: (state) => {
    return state.isAuthenticated
  },
  userDetails: (state) => {
    return state.user
  },
};

const mutations = {
  setTagsList(state, list) {
    state.tagsList.push(...list);
  },
  closePage(state, name) {
    state.cachePage.forEach((item, index) => {
      if (item === name) {
        state.cachePage.splice(index, 1);
      }
    });
  },
  increateTag(state, tagObj) {
    if (!Util.oneOf(tagObj.name, state.dontCache)) {
      state.cachePage.push(tagObj.name);
      localStorage.cachePage = JSON.stringify(state.cachePage);
    }
    state.pageOpenedList.push(tagObj);
  },
  initCachepage(state) {
    if (localStorage.cachePage) {
      state.cachePage = JSON.parse(localStorage.cachePage);
    }
  },
  removeTag(state, name) {
    state.pageOpenedList.map((item, index) => {
      if (item.name === name) {
        state.pageOpenedList.splice(index, 1);
      }
    });
  },
  pageOpenedList(state, get) {
    let openedPage = state.pageOpenedList[get.index];
    if (get.argu) {
      openedPage.argu = get.argu;
    }
    if (get.query) {
      openedPage.query = get.query;
    }
    state.pageOpenedList.splice(get.index, 1, openedPage);
    localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
  },
  clearAllTags(state) {
    state.pageOpenedList.splice(1);
    router.push({
      name: 'home_index'
    });
    state.cachePage.length = 0;
    localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
  },
  clearOtherTags(state, vm) {
    let currentName = vm.$route.name;
    let currentIndex = 0;
    state.pageOpenedList.forEach((item, index) => {
      if (item.name === currentName) {
        currentIndex = index;
      }
    });
    if (currentIndex === 0) {
      state.pageOpenedList.splice(1);
    } else {
      state.pageOpenedList.splice(currentIndex + 1);
      state.pageOpenedList.splice(1, currentIndex - 1);
    }
    let newCachepage = state.cachePage.filter(item => {
      return item === currentName;
    });
    state.cachePage = newCachepage;
    localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
  },
  setOpenedList(state) {
    state.pageOpenedList = localStorage.pageOpenedList ? JSON.parse(localStorage.pageOpenedList) : [otherRouter.children[0]];
  },
  setCurrentPath(state, pathArr) {
    state.currentPath = pathArr;
  },
  setCurrentPageName(state, name) {
    state.currentPageName = name;
  },
  addOpenSubmenu(state, name) {
    let hasThisName = false;
    let isEmpty = false;
    if (name.length === 0) {
      isEmpty = true;
    }
    if (state.openedSubmenuArr.indexOf(name) > -1) {
      hasThisName = true;
    }
    if (!hasThisName && !isEmpty) {
      state.openedSubmenuArr.push(name);
    }
  },
  clearOpenedSubmenu(state) {
    state.openedSubmenuArr.length = 0;
  },
  changeMenuTheme(state, theme) {
    state.menuTheme = theme;
  },
  changeMainTheme(state, mainTheme) {
    state.theme = mainTheme;
  },
  lock(state) {
    Cookies.set('locking', '1');
  },
  unlock(state) {
    Cookies.set('locking', '0');
  },
  setMenuList(state, menulist) {
    state.menuList = menulist;
  },
  updateMenulist(state) {
    let accessCode = parseInt(Cookies.get('access'));
    let menuList = [];
    appRouter.forEach((item, index) => {
      if (item.access !== undefined) {
        if (Util.showThisRoute(item.access, accessCode)) {
          if (item.children.length === 1) {
            menuList.push(item);
          } else {
            let len = menuList.push(item);
            let childrenArr = [];
            childrenArr = item.children.filter(child => {
              if (child.access !== undefined) {
                if (child.access === accessCode) {
                  return child;
                }
              } else {
                return child;
              }
            });
            menuList[len - 1].children = childrenArr;
          }
        }
      } else {
        if (item.children.length === 1) {
          menuList.push(item);
        } else {
          let len = menuList.push(item);
          let childrenArr = [];
          childrenArr = item.children.filter(child => {
            if (child.access !== undefined) {
              if (Util.showThisRoute(child.access, accessCode)) {
                return child;
              }
            } else {
              return child;
            }
          });
          let handledItem = JSON.parse(JSON.stringify(menuList[len - 1]));
          handledItem.children = childrenArr;
          menuList.splice(len - 1, 1, handledItem);
        }
      }
    });
    state.menuList = menuList;
  },
  setAvator(state, path) {
    localStorage.avatorImgPath = path;
  },
  setUserDetails(state, data) {
    state.user = data;
  },
  switchLang(state, lang) {
    state.lang = lang;
    Vue.config.lang = lang;
  },
  handleFullScreen(state) {
    let main = document.body;
    if (state.isFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (main.requestFullscreen) {
        main.requestFullscreen();
      } else if (main.mozRequestFullScreen) {
        main.mozRequestFullScreen();
      } else if (main.webkitRequestFullScreen) {
        main.webkitRequestFullScreen();
      } else if (main.msRequestFullscreen) {
        main.msRequestFullscreen();
      }
    }
  },
  changeFullScreenState(state) {
    state.isFullScreen = !state.isFullScreen;
  },
  login(state, response) {
    Cookies.set('password', 'password');
    Cookies.set('token', response.token);
    state.user = response.user;
    localStorage.avatorImgPath = 'https://image.flaticon.com/icons/png/512/78/78373.png';

    if (response.user.email === 'iview_admin') {
      Cookies.set('access', 1);
    } else {
      Cookies.set('access', 1);
    }

  },
  logout(state) {
    // Sign out
    Cookies.remove('user');
    Cookies.remove('password');
    Cookies.remove('hasGreet');
    Cookies.remove('access');
    Cookies.remove('token');
    // Empty data such as open pages, but save the subject data
    let theme = '';
    if (localStorage.theme) {
      theme = localStorage.theme;
    }
    localStorage.clear();
    if (theme) {
      localStorage.theme = theme;
    }
  },
  setUserDetails(state, response) {
    state.user = response;
    if (response.data === 'iview_admin') {
      Cookies.set('access', 1);
    } else {
      Cookies.set('access', 1);
    }
  }
};

const actions = {
  login(context, credentials) {
    return new Promise((resolve, reject) => {
      appService.login(credentials)
        .then((data) => {
          context.commit('login', data)
          resolve(data)
        })
        .catch((res) => {
          console.log(res);
          resolve(res);
        })
    })
  },
  logout(context) {
    // Sign out
    return new Promise((resolve, reject) => {
      appService.request({
          url: `/user/logout`,
          method: 'POST',
        })
        .then((data) => {
          context.commit('logout');
          resolve(data)
        })
        .catch((res) => {
          resolve(res);
        });
    });
  },
  generateOTP(context, credentials) {
    return appService.generateOTP(credentials)
  },
  getUserDetails(context) {
    const token = Cookies.get('token');
    return new Promise((resolve, reject) => {
      if (token) {
        appService.request({
            url: `/user/token/${token}`,
            method: 'GET',
          })
          .then((data) => {
            context.commit('setUserDetails', data);
            resolve(data);
          })
          .catch((res) => {
            context.commit('logout');
            // this.$router.push({
            //   name: 'login'
            // });
            // this.$store.dispatch('logout')
            resolve(res);
          });
      } else {
        // case of before login pages
        resolve({ success: true });
      }
    });
  }
}

// Status Management
export const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});