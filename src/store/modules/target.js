import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    target: [],
  },
  computed: {
  },
  mutations: {
    // target
    updateCurrentTarget(state, target){
      state.target = target;
    }
  },
  actions: {
    // target
    async fetchTarget({ commit }, data){
      const response = await axios.get("/api/target/" + data.asset_name + "/" + data.sub_asset_name + "/" + data.type_id.toString() + "?ts=" + new Date().getTime());
      commit('updateCurrentTarget', response.data);
    }
  },
  getters: {
    // target
    getTarget(state){
      return state.target;
    }
  }
}
