import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    permissions: []
  },
  computed: {
  },
  mutations: {    
    UpdatePermissions(state, permissions){
      state.permissions = permissions;
    }
  },
  actions: {    
    setPermissions({ commit }){
      axios.get("/api/permissions")
        .then((res) => {
          if(res.status == 200){
            commit('UpdatePermissions', res.data)
          }
        })
        .catch(console.error);        
    },
  },
  getters: {
    allowDeleteUser(state){
      var rule = state.permissions.filter((permission) => {
        return permission.resource == "Users" && permission.action == "Delete";
      });
      return rule[0] && rule[0].allow;
    },
    allowCreateUser(state){
      var rule = state.permissions.filter((permission) => {
        return permission.resource == "Users" && permission.action == "Create";
      });
      return rule[0] && rule[0].allow;
    },
    allowUpdateUser(state){
      var rule = state.permissions.filter((permission) => {
        return permission.resource == "Users" && permission.action == "Update";
      });
      return rule[0] && rule[0].allow;
    }
  }
}
