import Vue from 'vue'
import Vuex from 'vuex'

import usersModule from './store/modules/users'
import modelsModule from './store/modules/models'
import templatesModule from './store/modules/templates'
import jobsModule from './store/modules/jobs'
import monitoringModule from './store/modules/monitoring'
import targetModule from './store/modules/target'
import environmentsModule from './store/modules/environments'
import permissionsModule from './store/modules/permissions'

import authModule from './store/states/auth'
import queueModule from './store/states/queue'
import filesModule from './store/states/files'
import snackbarModule from './store/states/snackbar'
import sessionModule from './store/states/session'
import schedulerModule from './store/states/scheduler'
import toolchainModule from './store/states/toolchain'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    users: usersModule,
    models: modelsModule,
    templates: templatesModule,
    jobs: jobsModule,
    monitoring: monitoringModule,
    queue: queueModule,
    auth: authModule,
    files: filesModule,
    target: targetModule,
    snackbar: snackbarModule,
    session: sessionModule,
    scheduler: schedulerModule,
    environments: environmentsModule,
    permissions: permissionsModule,
    toolchain: toolchainModule,

  },
  state: {
  },
  computed: {
  },
  mutations: {
  },
  getters: {
  }
})

export default store