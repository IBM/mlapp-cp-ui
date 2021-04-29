import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    accuracyMonitoring: {},
    suggestions: [],
    loading: true
  },
  computed: {
  },
  mutations: {
    // models
    appendAccuracyMonitoring(state, accuracyMonitoring){  
      var original_accuracyMonitoring = JSON.parse(JSON.stringify(state.accuracyMonitoring));
      var new_keys = Object.keys(accuracyMonitoring);
      for (var i=0;i<new_keys.length;i++){
        var key = new_keys[i];
        var value = accuracyMonitoring[key];
        original_accuracyMonitoring[key] = value;
      }  
      state.accuracyMonitoring = original_accuracyMonitoring;
      state.loading = false;
    }, 
    updateAccuracyMonitoring(state, accuracyMonitoring){  
      state.accuracyMonitoring = accuracyMonitoring;
      state.loading = false;
    },   
    UpdateSuggestionsBox(state, suggestions){  
      state.suggestions = suggestions;
    }
  },
  actions: {        
    getForecastAccuracyMonitoring({ commit }, obj){
      var asset_name = obj.asset_name;
      var asset_label = obj.asset_label;
      
      axios.get("/api/accuracyMonitoring/"+asset_name+"/"+asset_label).then(function(response){
        commit('updateAccuracyMonitoring', response);
      });
    },

  },
  getters: {
    accuracyMonitoring(state){
      return state.accuracyMonitoring;
    },
    suggestions(state){
      return state.suggestions;
    },
  }
}
