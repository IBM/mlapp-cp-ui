import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    models: [],
    assetNames: [],
    assetLabels: [],
    models_history: [],
    available_asset_names: [],
    available_accuracies: [],
    available_asset_labels: [],
    dict: {},
    loading: true,
    stats: {
      number_of_trained_models: {'title': 'Number of trained models','value': ''},
      // acccuracy_of_best_model: {'title': 'Accuracy of best model','value': ''},
      average_run_time: {'title': 'Average run time of all models','value': ''},
      // last_time_of_model_training: {'title': 'Last time of model training','value': ''}
    },
  },
  computed: {
  },
  mutations: {
    // models
    updateCurrentModels(state, models){
      state.models = models;
      state.loading = false;
    },
    updateCurrentAssetNames(state, assetNames){
      state.assetNames = assetNames.map((model) => {
          return model.asset_name;
      });
    },
    updateCurrentAssetLabelNames(state, assetLabels){
      state.assetLabels = assetLabels;
    },
    updateCurrentModelStats(state, modelStats){
      var keys = Object.keys(modelStats);
      for (var i=0;i<keys.length;i++){
        var key = keys[i];
        var value = modelStats[key];

        if (key == "average_run_time"){
          value = 31200;
          if (value<1000){
            state.stats[key].value = value + "ms";
          }
          else {
            state.stats[key].value = parseInt(value/1000) + "s";
          }
        }
        else{
          state.stats[key].value = value;
        }
      }
    },
    updateModel(state, modelToUpdate){
      state.models = state.models.map((model) => {
        if(model.id == modelToUpdate.id){
          return modelToUpdate;
        }
        else{
          return model;
        }
      });
    },
    selectedAsBestModel(state, model){
      state.selectedModel = model.data[0];
    },
    deleteModel(state, modelToDelete){
      state.models = state.models.filter((model) => {
        return model.id != modelToDelete.id;
      });
    },
    updateAvailableAssetNames(state, asset_names){
      state.available_asset_names = Object.keys(asset_names);
    },
    updateAvailableAccuracies(state, accuracies){
      state.available_accuracies = Object.keys(accuracies);
    },
    updateAvailableAssetLabels(state, asset_labels){
      state.available_asset_labels = Object.keys(asset_labels);
    },
    updateCurrentModelsHistory(state, models_history){
      state.models_history = models_history;
    },
    updateModelsHistoryDictionary(state, models_history){
      state.model_history_dict = {};
      for (var i=0;i<models_history.length;i++){
        if (!state.model_history_dict[models_history[i].asset_name]){
          state.model_history_dict[models_history[i].asset_name] = {};
        }
        if (!state.model_history_dict[models_history[i].asset_name][models_history[i].asset_label]){
          state.model_history_dict[models_history[i].asset_name][models_history[i].asset_label] = [];
        }
        state.model_history_dict[models_history[i].asset_name][models_history[i].asset_label].push(models_history[i]);
        state.model_history_dict[models_history[i].asset_name][models_history[i].asset_label].sort(function(a, b) {
          var date_a = new Date(a.created_at);
          var date_b = new Date(b.created_at);
          if (date_b > date_a) return 1
          else return -1;
        });      
      }
    }    
  },
  actions: {
    async fetchAssetNames({ commit }){
      const response = await axios.get("/api/models/names");
      commit('updateCurrentAssetNames', response.data);
    },
    async fetchAssetLabelNames({ commit }, search){
      const response = await axios.get("/api/models/labels/"+search);
      commit('updateCurrentAssetLabelNames', response.data);
    },  
    async fetchModelStats({ commit }, model_obj){
      const response = await axios.get("/api/models/stats/"+model_obj.asset_name+"/"+model_obj.asset_label_name);
      commit('updateCurrentModelStats', response.data);
    }, 
    async fetchTrainModels({ commit }){
      const response = await axios.get("/api/models/models/train");

      var available_accuracies = {};
      var available_asset_names = {};
      var available_asset_labels = {};

      for(var item of response.data){
        // parse metadata json to object
        if(typeof item.metadata === 'string'){
          item.json_metadata = JSON.parse(item.metadata);
        }
        else{
          item.json_metadata = item.metadata;
        }
        
        if(typeof item.properties === 'string'){
          item.json_properties = JSON.parse(item.properties);
        }
        else{
          item.json_properties = item.properties;
        }
                
        // save available asset names
        available_asset_names[item.asset_name] = 1;
        
        // save available accuracies
        if (item.json_metadata && item.json_metadata.models && item.json_metadata.models.scores)
        {
          for(var acc in item.json_metadata.models.scores){
            available_accuracies[acc] = 1;
          }
        }

        // save available asset labels
        if(item.json_properties && item.json_properties.asset_label){
          available_asset_labels[item.json_properties.asset_label] = 1;
        }
      }
      commit('updateCurrentModels', response.data);
      commit('updateAvailableAssetNames', available_asset_names);
      commit('updateAvailableAccuracies', available_accuracies);
      commit('updateAvailableAssetLabels', available_asset_labels);
    },
    async fetchTrainModelsByAssetName({ commit }, asset_name){
      const response = await axios.get("/api/models/models/asset/"+asset_name);
      var available_accuracies = {};
      var available_asset_names = {};
      var available_asset_labels = {};

      for(var item of response.data){
        // parse metadata json to object
        if(typeof item.metadata === 'string'){
          item.json_metadata = JSON.parse(item.metadata);
        }
        else{
          item.json_metadata = item.metadata;
        }
        
        if(typeof item.properties === 'string'){
          item.json_properties = JSON.parse(item.properties);
        }
        else{
          item.json_properties = item.properties;
        }
                
        // save available asset names
        available_asset_names[item.asset_name] = 1;
        
        // save available accuracies
        if (item.json_metadata && item.json_metadata.models && item.json_metadata.models.scores)
        {
          for(var acc in item.json_metadata.models.scores){
            available_accuracies[acc] = 1;
          }
        }

        // save available asset labels
        if(item.json_properties && item.json_properties.asset_label){
          available_asset_labels[item.json_properties.asset_label] = 1;
        }
      }
      commit('updateCurrentModels', response.data);
      commit('updateAvailableAssetNames', available_asset_names);
      commit('updateAvailableAccuracies', available_accuracies);
      commit('updateAvailableAssetLabels', available_asset_labels);
    },
    async fetchModels({ commit }){
      const response = await axios.get("/api/models");

      var available_accuracies = {};
      var available_asset_names = {};
      var available_asset_labels = {};

      for(var item of response.data){
        // parse metadata json to object
        if(typeof item.metadata === 'string'){
          item.json_metadata = JSON.parse(item.metadata);
        }
        else{
          item.json_metadata = item.metadata;
        }
        
        if(typeof item.properties === 'string'){
          item.json_properties = JSON.parse(item.properties);
        }
        else{
          item.json_properties = item.properties;
        }
        
        
        // save available asset names
        available_asset_names[item.asset_name] = 1;
        
        // save available accuracies
        if (item.json_metadata && item.json_metadata.models && item.json_metadata.models.scores)
        {
          for(var acc in item.json_metadata.models.scores){
            available_accuracies[acc] = 1;
          }
        }

        // save available asset labels
        if(item.json_properties && item.json_properties.asset_label){
          available_asset_labels[item.json_properties.asset_label] = 1;
        }
      }
      commit('updateCurrentModels', response.data);
      commit('updateAvailableAssetNames', available_asset_names);
      commit('updateAvailableAccuracies', available_accuracies);
      commit('updateAvailableAssetLabels', available_asset_labels);
    },
    async fetchModelsHistory({ commit }){
      const response = await axios.get("/api/models/models_history");
      commit('updateCurrentModelsHistory', response.data);
      commit('updateModelsHistoryDictionary', response.data);
    },
    selectModel({ commit, dispatch }, data){   
      console.log(commit);  
      var dataToPost = {
        current_model: {
          model_id: data.current_model.model_id,
          asset_name: data.current_model.asset_name,
          asset_label: data.current_model && data.current_model.json_properties && data.current_model.json_properties.asset_label,
        },
        deploy_version: data.current_model.json_properties.deploy_version,
        toolchain: data.toolchain
      };
      axios.post("/api/models/select_model/", dataToPost)
        .then(function(res){
          console.log(res)
          if (res.status == 200){
            dispatch('fetchModelsHistory');
            commit('snackbar/setSnack', {'message': res.data || 'Model select request has been called successfully!', 'color': 'success'}, { root: true });
          }
          else{
            commit('snackbar/setSnack', {'message': res.data, 'color': 'error'}, { root: true });
          }
        })
        .catch(function(error){
          console.error(error); /* eslint-disable-line no-console */
        });
    },
    updateModel({ commit }, model){
      var modelToUpdate = {
        id: model.id
      };
      axios.put("/api/models/update/" + model.model_id, modelToUpdate)
        .then(() => commit('updateModel', model))
        .catch(console.error); /* eslint-disable-line no-console */
    },
    deleteModel({ commit }, model){
      axios.delete("/api/models/delete/" + model.id)
        .then(() => commit('deleteModel', model))
        .catch(console.error); /* eslint-disable-line no-console */
    },
    async ssologin({ commit }){
      const response = await axios.get("/api/ssologin");
      commit('aaa', response.data);

    }

  },
  getters: {
    // Models
    getModels(state){
      return state.models;
    },
    getAssetNames(state){
      return state.assetNames;
    },
    getAssetLabelNames(state){
      return state.assetLabels;
    },
    getModelStats(state){
      return state.stats;
    },
    getAvailableAssetNames(state){
      return state.available_asset_names;
    },
    getAvailableAccuracies(state){
      return state.available_accuracies;
    },
    getAvailableAssetLabels(state){
      return state.available_asset_labels;
    },
    getSelectedModels(state){
      var selected_arr = [];

      if (state.models_history.length == 0){
        return selected_arr;
      }

      var asset_name_keys = Object.keys(state.model_history_dict);
      for (var i=0;i<asset_name_keys.length;i++){
        var asset_labels_obj = state.model_history_dict[asset_name_keys[i]];
        var asset_label_keys = Object.keys(asset_labels_obj);
        for (var j=0;j<asset_label_keys.length;j++){
          var model_obj = asset_labels_obj[asset_label_keys[j]];
          selected_arr.push(model_obj[0]);
        }
      }
      return selected_arr;
    },
    getModelsHistoryDictionary(state){
      return state.model_history_dict;
    },
    getModelsHistory(state){
      return state.models_history;
    },
    getSelectedModel(state){
      return state.selectedModel;
    },
    isLoading(state){
      return state.loading;
    },
  }
}
