import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    files: [],
    logger_file: '',
    config_file: '',
    image_file: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    loading: true,
    logger_file_loading: true,
    config_file_loading: true,
    image_file_loading: true,
    images: [],
    images_loading: true
  },
  computed: {
  },
  mutations: {
    updateCurrentFiles(state, files){
      state.files = files;
    },
    updateCurrentConfigFile(state, file){
      state.config_file = file;
    },
    updateCurrentLoggerFile(state, file){
      state.logger_file = file;
    },
    updateCurrentImageFile(state, file){
      state.image_file = file;
    },
    setLoading(state, isLoading){
      state.loading = isLoading;
    },
    setConfigLoading(state, isLoading){
      state.config_file_loading = isLoading;
    },
    setLoggerLoading(state, isLoading){
      state.logger_file_loading = isLoading;
    },
    setImageLoading(state, isLoading){
      state.image_file_loading = isLoading;
    }
  },
  actions: {
    async queryFileStorage({ commit }, prefix){
        commit('setLoading', true);
        commit('setLoggerLoading', true);
        commit('setConfigLoading', true);
        commit('setImageLoading', true);
        commit('updateCurrentFiles', []);
        commit('updateCurrentConfigFile', '');
        commit('updateCurrentLoggerFile', '');
        commit('updateCurrentImageFile', '');
        const response = await axios.get("/api/files/query/" + prefix);
        commit('setLoading', false);
        try{
          if(response.data["logger"] && !response.data["logger"].length){
            commit('setLoggerLoading', false);
          }
        }
        catch(e){
          console.error(e);
        }
        try{
          if(response.data["config"] && !response.data["config"].length){
            commit('setConfigLoading', false);
          }  
        }
        catch(e){
          console.error(e);
        }
        commit('updateCurrentFiles', response.data);
    },
    downloadFile(NULL, props){
      axios.get('/api/files/download/' + props.bucket + '/' + props.key, {
          responseType: 'blob'
      }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', props.key); //or any other extension
          document.body.appendChild(link);
          link.click();
      });
    },
    streamFile({ commit }, props){      
      axios.get('/api/files/download/' + props.bucket + '/' + props.key, {
        responseType: 'blob'
      }).then((response) => {
        const reader = new FileReader();

        // This fires after the blob has been read/loaded.
        reader.addEventListener('loadend', (e) => {
          commit(props.callback_function, e.srcElement.result);
          commit(props.loading_commit, false);
        });
        reader.readAsText(response.data);
      }).catch(function(){
        commit(props.loading_commit, false);
      });
    },
    streamImage({ commit }, props){     
      commit(props.loading_commit, true);
      axios.get('/api/files/download/' + props.bucket + '/' + props.key, {
        responseType: 'blob'
      }).then((response) => {
        const reader = new FileReader();

        // This fires after the blob has been read/loaded.
        reader.addEventListener('loadend', (e) => {
          commit(props.callback_function, e.srcElement.result);
          commit(props.loading_commit, false);
        });
        reader.readAsArrayBuffer(response.data);
      }).catch(function(){
        commit(props.loading_commit, false);
      });

    },
    deleteFilesOfAsset({ commit }, template){
      axios.delete("/api/files/delete/" + template.id)
        .then(() => commit('deleteFilesOfAsset', template))
        .catch(console.error); /* eslint-disable-line no-console */
    }
  },
  getters: {
    getFiles(state){
      return state.files;
    },
    getConfigFile(state){
      return state.config_file;
    },
    getLoggerFile(state){
      return state.logger_file;
    },
    getImageFile(state){
      return state.image_file;
    },
    isLoading(state){
      return state.loading;
    },
    isConfigLoading(state){
      return state.config_file_loading;
    },
    isLoggerLoading(state){
      return state.logger_file_loading;
    },
    isImageLoading(state){
      return state.image_file_loading;
    }
  }
}
