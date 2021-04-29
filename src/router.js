import Vue from 'vue'
import Router from 'vue-router'
import global_config from '../config'

const Logout = () => {
  if (global_config['login_type'] == "w3"){
    localStorage.removeItem("logged-in");
    location.href = global_config["api"]["base_url"] + "/auth/logout";
  }
  else{
    localStorage.removeItem("auth-token");
    location.href = "/login";
  }
}

// when visiting login page, check if their is an auth token - if so, redirect to main
// if auth token is invalid, it is deleted via middleware (see main.js)
const isLoggedIn = (to, from, next) => {
  console.log(global_config);
  // if login is required
  if(global_config['login_required']){
    // w3 active directory login
    if(global_config['login_type'] == 'w3'){
      if (localStorage.getItem("logged-in")){
        next('/')
        return
      }
      else{
        if (to.query.status == "1"){
          localStorage.setItem("logged-in", true);
          next('/')
          return
        }
        // not logged in
        next()
        return
      }
    }
    // basic login
    else{
      if (localStorage.getItem("auth-token")) {
        next('/')
        return
      }
    }
  }
  // no login required (running locally)
  else{
    next('/')
    return
  }
  // not logged in
  next()
  return
}

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/dashboard',
      component: () => import('./views/dashboard/Layout.vue'),
      children: [
        {
          path: '/',
          component: () => import('./views/dashboard/pages/Main.vue')
        },
        {
          path: 'map',
          component: () => import('./views/dashboard/pages/Map.vue')
        },
        {
          path: 'self-service-portal',
          component: () => import('./views/dashboard/pages/SelfServicePortal.vue')
        }
      ]
    },
    {
      path: '/',
      component: () => import('./views/admin/AdminLayout.vue'),
      children: [        
        {
          path: 'map',
          component: () => import('./views/admin/pages/Map.vue')
        },
        {
          path: 'activity',
          component: () => import('./views/admin/pages/Activity.vue')
        },
        {
          path: 'users',
          component: () => import('./views/admin/pages/Users.vue')
        },
        {
          path: 'permissions',
          component: () => import('./views/admin/pages/Permissions.vue')
        },
        {
          path: 'data-insights',
          component: () => import('./views/admin/pages/DataInsights.vue')
        },
        {
          path: 'run',
          component: () => import('./views/admin/pages/Run.vue')
        },
        {
          path: 'results',
          component: () => import('./views/admin/pages/analysis_results/Results.vue')
        },
        {
          path: 'jobs',
          component: () => import('./views/admin/pages/Jobs.vue')
        },
        {
          path: 'asset-summary',
          component: () => import('./views/admin/pages/AssetSummary.vue')
        },
        {
          path: 'scheduler',
          component: () => import('./views/admin/pages/Scheduler.vue')
        },
        {
          path: '/',
          component: () => import('./views/admin/pages/ModelRegister.vue')
        },
        // {
        //   path: 'actions',
        //   component: () => import('./views/admin/pages/Actions.vue')
        // },
      ]
    },
    {
      path: '/w3-login',
      name: 'w3-login',
      beforeEnter: isLoggedIn,
      component: () => import('./views/login/W3Login.vue')
    },
    {
      path: '/login',
      name: 'login',
      beforeEnter: isLoggedIn,
      component: () => import('./views/login/BasicLogin.vue')
    },
    {
      path: '/logout',
      name: 'logout',
      beforeEnter: Logout,
      component: () => import('./views/logout/Logout.vue')
    },
    {
      path: '*',
      name: 'NotFound',
      component: () => import('./views/NotFound.vue')
    }

  ]
})

export default router