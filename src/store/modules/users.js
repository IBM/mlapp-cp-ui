import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    users: [],
    loading: true
  },
  computed: {
  },
  mutations: {
    // Users
    updateCurrentUsers(state, users){
      state.users = users;
      state.loading = false;
    },
    updateUser(state, userToUpdate){
      state.users = state.users.map((user) => {
        if(user.iui == userToUpdate.iui){
          return userToUpdate;
        }
        else{
          return user;
        }
      });
    },
    createUser(state, newUser) {
      state.users.push(newUser);
    },
    deleteUser(state, userToDelete){
      state.users = state.users.filter((user) => {
        return user.iui != userToDelete.iui;
      });
    }
  },
  actions: {
    // Users
    fetchUsers({ commit }){
      axios.get("/api/users/").then(function(response) {
        if (response.status == 200){
          for(var item of response.data){
            item.status = item.status.toString();
          }
          commit('updateCurrentUsers', response.data);
        }
        else{
          commit('snackbar/setSnack', {'message': response.data.error, 'color': 'error'}, { root: true });
          commit('updateCurrentUsers', []);
        }
      });
    },
    updateUser({ commit }, user){      
      var userToUpdate = {
        iui: user.iui,
        email: user.email,
        status: user.status,
        role: user.role
      };
      axios.put("/api/users/update/" + userToUpdate.iui, userToUpdate)
        .then(() => commit('updateUser', user))
        .catch(console.error).finally(function() {
        }); /* eslint-disable-line no-console */
    },
    createUser({ commit }, user) {
      user.iui = Math.random().toString(36).replace('0.', '');
      axios.post("/api/users/create/", user)
        .then(() => commit('createUser', user))
        .catch(console.error); /* eslint-disable-line no-console */
    },
    deleteUser({ commit }, user){
      axios.delete("/api/users/delete/" + user.iui)
        .then(() => commit('deleteUser', user))
        .catch(console.error); /* eslint-disable-line no-console */
    },

    login(){
      axios.post('/sso_req').then(function(data) {
          console.log(data);
          window.location.href = '/sso';
      }).finally(function() {
      });
    }

  },
  getters: {
    // Users
    getUsers(state){
      return state.users;
    },
    isLoading(state){
      return state.loading;
    }
  }
}
