import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    stats: {},
  },
  computed: {
  },
  mutations: {
  },
  actions: {
    changeStagingVersion({ commit }, data){
      axios.post("/api/environments/change-staging-version",{ model_id: data.model_id, pipeline_version: data.version });
      commit('snackbar/setSnack', {'message': 'Your request has been sent successfuly', 'color': 'success'}, { root: true });
    },
  },
  getters: {
  }
}
