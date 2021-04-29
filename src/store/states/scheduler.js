import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    stats: {},
    schedules: [],
    loading: true
  },
  computed: {    
  },
  mutations: {
    updateCurrentSchedules(state, schedules){
      state.schedules = schedules;
      state.loading = false;
    },
  },
  actions: {
    async fetchSchedules({ commit }){
      const response = await axios.get("/api/scheduler?ts=" + new Date().getTime());   
      var schedules = response.data || [];
      for (var i=0;i<schedules.length;i++){
        var schedule = schedules[i];
        const response2 = await axios.get("/api/jobs/get/lastJobOfSchedule/"+schedule.id);
        var lastJob = response2.data || null;
        schedule.lastJob = lastJob;
      }
      commit('updateCurrentSchedules', schedules);      
    },
    async createSchedule({ commit }, conf){
      axios.post("/api/scheduler/set", conf)
      .then(async function() {
        const response = await axios.get("/api/scheduler?ts=" + new Date().getTime());      
        commit('updateCurrentSchedules', response.data);     
        // commit('snackbar/setSnack', {'message': 'Your job has been sent successfully!', 'color': 'success'}, { root: true });
        // dispatch('jobs/fetchJobs', null, { root: true });
      })
      .catch(function(){
        commit('snackbar/setSnack', {'message': 'Job was not sent: error in input!', 'color': 'error'}, { root: true });
      }); /* eslint-disable-line no-console */
    },
    async updateSchedule({ commit }, conf){
      axios.post("/api/scheduler/update", conf)
      .then(async function() {
        const response = await axios.get("/api/scheduler?ts=" + new Date().getTime());      
        commit('updateCurrentSchedules', response.data);     
        // commit('snackbar/setSnack', {'message': 'Your job has been sent successfully!', 'color': 'success'}, { root: true });
        // dispatch('jobs/fetchJobs', null, { root: true });
      })
      .catch(function(){
        commit('snackbar/setSnack', {'message': 'Job was not sent: error in input!', 'color': 'error'}, { root: true });
      }); /* eslint-disable-line no-console */
    },
    async deleteSchedule({ commit }, conf){
      axios.post("/api/scheduler/delete", conf)
      .then(async function() {
        const response = await axios.get("/api/scheduler?ts=" + new Date().getTime());      
        commit('updateCurrentSchedules', response.data);     
      })
      .catch(function(){
        commit('snackbar/setSnack', {'message': 'Job was not sent: error in input!', 'color': 'error'}, { root: true });
      });
    },
  },
  getters: {
    getSchedules(state){
      return state.schedules;
    },
    isLoading(state){
      return state.loading;
    }
  }
}
