import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    templates: [],
    current_asset_name: null,
    current_pipeline_name: null,
    current_template: null,
    available_asset_names: [],
    available_pipeline_templates: [],
    pipeline_templates: {},
    loading: true
  },
  computed: {
  },
  mutations: {
    createTemplate(state, createdTemplate){
      state.templates.push(createdTemplate);
    },
    updateCurrentTemplates(state, templates){
      state.templates = templates;
      state.loading = false;
    },
    updateAvailableAssetsNames(state, assets_names){
      state.available_asset_names = assets_names;
    },
    updateAvailablePipelineNames(state, pipelines_names){
      state.available_pipeline_templates = pipelines_names;
    },
    updateCurrentAssetName(state, name){
      state.current_asset_name = name;
      localStorage.setItem('asset_name', state.current_asset_name)
      state.current_pipeline_name = null;
      if (state.pipeline_templates && state.pipeline_templates[name]){
        var pipelines = Object.keys(state.pipeline_templates[name])
        if (pipelines && pipelines[0]){
          state.current_pipeline_name = pipelines[0];
          var template_object = state.templates.find(template => template.name == state.current_asset_name);
          var response = template_object && template_object.pipeline_templates[state.current_pipeline_name];
          state.current_template = template_object && (typeof response === 'string') ? JSON.parse(response) : response;
        }
      }
    },
    updateCurrentPipelineName(state, name){
      state.current_pipeline_name = name;

      var template_object = state.templates.find(template => template.name == state.current_asset_name);
      var response = template_object && template_object.pipeline_templates[state.current_pipeline_name];
      state.current_template = template_object && (typeof response === 'string') ? JSON.parse(response) : response;
    },
    updateTemplate(state, templateToUpdate){
      state.templates = state.templates.map((template) => {
        if(template.id == templateToUpdate.id){
          return templateToUpdate;
        }
        else{
          return template;
        }
      });
    },
    deleteTemplate(state, templateToDelete){
      state.templates = state.templates.filter((template) => {
        return template.id != templateToDelete.id;
      });
    },
    updatePipelineTemplates(state, pipelineTemplates){
      state.pipeline_templates = pipelineTemplates;
    },
  },
  actions: {
    async fetchTemplates({ commit }){
      const response = await axios.get("/api/templates/");
      
      var pipeline_templates = {};
      var available_asset_names = []

      for(var i=0; i<response.data.length; i++){
        var item = response.data[i];
        if(item.enabled){
          var asset_name = item.name;
          available_asset_names.push(asset_name);

          item.pipeline_templates = typeof item.pipeline_templates == "object" ? item.pipeline_templates : JSON.parse(item.pipeline_templates);
          item.template = typeof item.template == "object" ? item.template : JSON.parse(item.template);

          pipeline_templates[asset_name] = item.pipeline_templates;
        }
      }

      commit('updatePipelineTemplates', pipeline_templates);
      commit('updateCurrentTemplates', response.data);
      commit('updateAvailableAssetsNames', available_asset_names);
      if(available_asset_names.length > 0){
        var asset_name = localStorage.getItem('asset_name')
        if(asset_name && available_asset_names.indexOf(asset_name) > -1){
          commit('updateCurrentAssetName', asset_name);
        }
        else{
          commit('updateCurrentAssetName', available_asset_names[0]);
        }
      }
    },
    createTemplate({ commit }, template){
      var templateToCreate = {
        name: template.name,
        template: template.template,
        pipeline_templates: template.pipeline_templates,
        enabled: template.enabled?true:false
      };
      axios.post("/api/templates/create", templateToCreate)
        .then(function(createdTemplate){
          commit('createTemplate', createdTemplate.data);
          commit('snackbar/setSnack', {'message': 'You have registered your model successfully!', 'color': 'success'}, { root: true });
        })
        .catch(function(){
          commit('snackbar/setSnack', {'message': 'Error in registering your model!', 'color': 'error'}, { root: true });
        });
    },
    updateTemplate({ commit }, template){
      var templateToUpdate = {
        id: template.id,
        name: template.name,
        template: template.template,
        pipeline_templates: template.pipeline_templates,
        enabled: template.enabled
      };
      axios.put("/api/templates/update/" + template.id, templateToUpdate)
        .then(function(){
          commit('updateTemplate', template);
          commit('snackbar/setSnack', {'message': 'Registered model updated successfully!', 'color': 'success'}, { root: true });
        })
        .catch(function(){
          commit('snackbar/setSnack', {'message': 'Error in updating your registered model!', 'color': 'error'}, { root: true });
        });
    },
    updateAssetName({ commit }, asset_name){
      commit('updateCurrentAssetName', asset_name);
    },
    updatePipelineName({ commit }, pipeline_name){
      commit('updateCurrentPipelineName', pipeline_name);
    },
    deleteTemplate({ commit }, template){
      axios.delete("/api/templates/delete/" + template.id)
        .then(() => commit('deleteTemplate', template))
        .catch(console.error); /* eslint-disable-line no-console */
    }
  },
  getters: {
    getTemplates(state){
      return state.templates;
    },
    getAvailableAssetsNames(state){
      return state.available_asset_names;
    },
    getAvailablePipelineTemplates(state){
      return state.pipeline_templates[state.current_asset_name];
    },
    getCurrentAsset(state){
      return state.current_asset_name;
    },
    getCurrentPipeline(state){
      return state.current_pipeline_name;
    },
    getTemplateByAssetNameAndPipelineName(state){
      return state.current_template;
    },
    isLoading(state){
      return state.loading;
    }
  }
}
