import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    redis_logs: '',
  },
  computed: {
  },
  mutations: {
    updateCurrentRedisLogs(state, logs){
      state.redis_logs = logs;
    },
  },
  actions: {
    async getLogs({ commit }, job_id){
      const session_response = await axios.get("/api/session/get/" + job_id);
      if (session_response && session_response.data){
        commit('updateCurrentRedisLogs', JSON.parse(session_response.data));
      }  
      else{
        commit('updateCurrentRedisLogs', '');
      }    
      
    },
  },
  getters: {
    getRedisLogs(state){
      return state.redis_logs;
    },
  }
}
