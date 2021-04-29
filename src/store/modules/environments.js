import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import global_config from '../../../config';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    versions: {
      'dev': 0,
      'staging': 0,
      'prod': 0
    },
    current_env: global_config.deployment == 'ibmcloud' ? 'dev' : global_config.deployment
  },
  computed: {
  },
  mutations: {   
    updateVersions(state, versions){
      for (var i=0;i<versions.length;i++){
        state.versions[versions[i].env] = {value: versions[i].version, updating_to: versions[i].updating_to};
      }
    },
    updateCurrentEnv(state, env){
      state.current_env = env;
    } 
  },
  actions: {    
    async getVersions({ commit }){      
      const response = await axios.get("/api/environments");
      commit('updateVersions', response.data);      
    },    
    updateEnv({ commit }, env){
      commit('updateCurrentEnv', env);
    },
  },
  getters: {
    // Jobs
    getVersions(state){
      return state.versions;
    },
    getCurrentEnv(state){
      return state.current_env;
    }
  }
}
