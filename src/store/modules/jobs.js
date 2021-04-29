import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    jobs: [],
    available_asset_names: [],
    available_asset_labels: [],
    available_pipelines: [],
    available_status_codes: [],
    loading: true,
    cancelingJob: false
  },
  computed: {
  },
  mutations: {
    // jobs
    updateCurrentJobs(state, jobs){
      state.jobs = jobs;
      state.loading = false;
    },
    updateJob(state, jobToUpdate){
      state.jobs = state.jobs.map((job) => {
        if(job.id == jobToUpdate.id){
          return jobToUpdate;
        }
        else{
          return job;
        }
      });
    },
    deleteJob(state, jobToDelete){
      state.jobs = state.jobs.filter((job) => {
        return job.id != jobToDelete.id;
      });
    },
    purgeQueuedJobs(state){
      for (var i=0;i<state.jobs.length;i++){
        if (state.jobs[i].status_code == 0){
          state.jobs[i].status_code = -1;
          state.jobs[i].status_msg = 'manually stopped';
          state.jobs[i].updated_at = new Date();
        }
      }
    },
    updateAvailableAssetNames(state, asset_names){
      state.available_asset_names = Object.keys(asset_names);
    },
    updateAvailableAssetLabels(state, asset_labels){
      state.available_asset_labels = Object.keys(asset_labels);
    },
    updateAvailablePipelines(state, pipelines){
      state.available_pipelines = Object.keys(pipelines);
    },
    updateAvailableStatusCodes(state, status_codes){
      state.available_status_codes = Object.keys(status_codes);
    },
    cancelingJob(state, val){
      state.cancelingJob = val;
    }
  },
  actions: {
    // Jobs
    async fetchJobs({ commit }){
      const response = await axios.get("/api/jobs?ts=" + new Date().getTime());
      var available_asset_names = {};
      var available_asset_labels = {};
      var available_pipelines = {};
      var available_status_codes = {};

      for(var item of response.data){     
        if (item.data){
          item['json_data'] = (typeof item.data == "object") ? item.data : JSON.parse(item.data);
          if (item['json_data'].length){
            item['json_data'] = item['json_data'][0];
          }
        }
        var asset_name = null;
        var asset_label = null;
        var pipeline = null;
        var status_code = item.status_code;

        if (item.data){     
          pipeline = item.json_data.pipeline;           
          asset_name = item.json_data.asset_name;
          asset_label = item.json_data.asset_label;
        }
        if (asset_name != null){
          // save available asset names
          available_asset_names[asset_name] = 1;
        }
        if (asset_label != null){
          // save available asset names
          available_asset_labels[asset_label] = 1;
        }
        if (pipeline != null){
          // save available asset names
          available_pipelines[pipeline] = 1;
        }
        if (status_code != null){
          // save available asset names
          available_status_codes[item.status_code] = 1;
        }
      }
      commit('updateAvailableAssetNames', available_asset_names);
      commit('updateAvailableAssetLabels', available_asset_labels);
      commit('updateAvailablePipelines', available_pipelines);
      commit('updateAvailableStatusCodes', available_status_codes);
      // for(var item of response.data){}
      commit('updateCurrentJobs', response.data);      
    },
    updateJob({ commit }, job){
      var jobToUpdate = {
        id: job.id
      };
      axios.put("/api/jobs/update/" + job.id, jobToUpdate)
        .then(() => commit('updateJob', job))
        .catch(console.error); /* eslint-disable-line no-console */
    },
    deleteJob({ commit }, job){
      axios.delete("/api/jobs/delete/" + job.id)
        .then(() => commit('deleteJob', job))
        .catch(console.error); /* eslint-disable-line no-console */
    },

    
    cancelJob({ commit }, job){

      function is_in_forecast_queue(job){
          var in_forecast_queue = true;
      
          for (var i=0;i<job.data.length;i++){
              if (job.data[i].pipeline != "forecast"){
                in_forecast_queue = false;
              }
          }
      
          return in_forecast_queue;
      }

      var message = {
        type: "cancel",
        job_id: job.id,
        in_forecast_queue: is_in_forecast_queue(job)
      }

      commit('cancelingJob', true);
      axios.post("/api/queue/send/", message)
        .then(function() {
          commit('deleteJob', job);
          commit('cancelingJob', false);
        })
        .catch(function(){
        });

      event.stopPropagation();
    }
  },
  getters: {
    // Jobs
    getJobs(state){
      return state.jobs;
    },
    getAvailableAssetNames(state){
      return state.available_asset_names;
    },
    getAvailableAssetLabels(state){
      return state.available_asset_labels;
    },
    getAvailablePipelines(state){
      return state.available_pipelines;
    },
    getAvailableStatusCodes(state){
      return state.available_status_codes;
    },
    cancelingJob(state){
      return state.cancelingJob;
    },
    isLoading(state){
      return state.loading;
    }
  }
}
