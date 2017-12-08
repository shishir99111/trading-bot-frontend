import Main from './views/Main.vue';

// The pages that are not displayed as sub-pages of the Main component are written separately as follows
export const loginRouter = {
  path: '/login',
  name: 'login',
  meta: {
    title: 'Login'
  },
  component: resolve => {
    require(['./views/login.vue'], resolve);
  }
};

export const page404 = {
  path: '/*',
  name: 'error_404',
  meta: {
    title: '404-Page does not exist'
  },
  component: resolve => {
    require(['./views/error_page/404.vue'], resolve);
  }
};

export const page401 = {
  path: '/401',
  meta: {
    title: '401-Insufficient permissions'
  },
  name: 'error_401',
  component: resolve => {
    require(['./views/error_page/401.vue'], resolve);
  }
};

export const page500 = {
  path: '/500',
  meta: {
    title: '500-Server error'
  },
  name: 'error_500',
  component: resolve => {
    require(['./views/error_page/500.vue'], resolve);
  }
};

export const locking = {
  path: '/locking',
  name: 'locking',
  component: resolve => {
    require(['./views/main_components/locking-page.vue'], resolve);
  }
};

// A sub-page that is displayed as a Main component but is not displayed in the left menu is written in otherRouter
export const otherRouter = {
  path: '/',
  name: 'otherRouter',
  component: Main,
  children: [{
    path: 'home',
    title: {
      i18n: 'home'
    },
    name: 'home_index',
    component: resolve => {
      require(['./views/home/home.vue'], resolve);
    }
  }]
};

// The sub-page that is displayed as the main component and the route displayed on the left menu is written in the appRouter
export const appRouter = [{
  path: '/error-page',
  icon: 'android-sad',
  title: 'Error page',
  name: 'errorpage',
  component: Main,
  children: [{
    path: 'index',
    title: 'Error page',
    name: 'Error Page',
    component: resolve => {
      require(['./views/error_page/error-page.vue'], resolve);
    }
  }]
}, ];

// All the routes defined above should be written in the routers below
export const routers = [
  loginRouter,
  otherRouter,
  locking,
  ...appRouter,
  page500,
  page401,
  page404
];