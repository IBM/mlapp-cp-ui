import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    stats: {},
    size: 0
  },
  computed: {
  },
  mutations: {
    updateQueueSize(state, size){
      state.size = size;
    },
  },
  actions: {
    sendMessage({ commit, dispatch }, message){
      var method = message.toolchain ? "toolchain-send" : "send";
      axios.post("/api/queue/"+method+"/", message)
        .then(function(res) {
          if(method == 'toolchain-send'){
            if (res.status == 200){
              commit('snackbar/setSnack', {'message': ('Your job has been sent successfuly: ' +  res.data) || 'Re-train in staging has been called successfully!', 'color': 'success'}, { root: true });
              dispatch('jobs/fetchJobs', null, { root: true });
            }
            else{
              commit('snackbar/setSnack', {'message': res.data, 'color': 'error'}, { root: true });
            }
          }
          else{
            commit('snackbar/setSnack', {'message': 'Your job has been sent successfully!', 'color': 'success'}, { root: true });
            dispatch('jobs/fetchJobs', null, { root: true });
          }
        })
        .catch(function(){
          commit('snackbar/setSnack', {'message': 'Job was not sent: error in input!', 'color': 'error'}, { root: true });
        }); /* eslint-disable-line no-console */
    },
    sendConfigGenerator({ commit, dispatch }, message){
      axios.post("/api/queue/config-generator/", message)
      .then(function() {
        commit('snackbar/setSnack', {'message': 'Your job has been sent successfully!', 'color': 'success'}, { root: true });
        dispatch('jobs/fetchJobs', null, { root: true });
      })
      .catch(function(){
        commit('snackbar/setSnack', {'message': 'Job was not sent: error in input!', 'color': 'error'}, { root: true });
      }); /* eslint-disable-line no-console */
    },
    purge({ commit }){
      axios.post("/api/queue/purge")
        .then(function() {
          commit('snackbar/setSnack', {'message': 'Queue has been purged successfully!', 'color': 'success'}, { root: true });
          commit('jobs/purgeQueuedJobs', null, { root: true });
        })
        .catch(function(){
        });
    },
    sendFiles({ commit }, files){
      let formData = new FormData();
      for (var i=0;i<files.length;i++){
        formData.append('file', files[i]);        
      }

      axios.post( '/api/queue/upload',
          formData,
          {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
        }
      ).then(function(){
        commit('snackbar/setSnack', {'message': 'Files have been has been uploaded successfully!', 'color': 'success'}, { root: true });
      })
      .catch(function(){
        commit('snackbar/setSnack', {'message': 'Files failed to upload!', 'color': 'success'}, { root: true });
      });

    },
  },
  getters: {
    // Jobs
    getStats(state){
      return state.jobs;
    },
    getSize(state){
      return state.size;
    }
  }
}
