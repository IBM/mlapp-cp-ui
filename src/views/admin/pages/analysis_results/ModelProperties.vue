<template>
    <v-container fluid style="height:100%; padding: 0px;">
        <v-row no-gutters style="height:60px;">
        <v-col cols="12">
            <v-toolbar class="blue">
                <v-icon class="mr-2">perm_data_setting</v-icon>
                <v-toolbar-title>Run Id: {{model.model_id }} <v-icon @click="copyToClipboard(model.model_id)">mdi-content-copy</v-icon></v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="closeDialog()">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-toolbar>
        </v-col>
        </v-row>
        <v-row no-gutters style="height: calc(100% - 60px);">
        <v-col cols="12">
            <v-tabs color="white" dark centered icons-and-text grow background-color="blue" style="height: 100%;" v-on:change="tabSwitched">         
                <v-tab>Model Output<v-icon>format_align_center</v-icon></v-tab>
                <v-tab>Coefficients<v-icon>view_comfy</v-icon></v-tab>
                <v-tab>Files<v-icon>folder</v-icon></v-tab>
                <v-tab>Config<v-icon>settings</v-icon></v-tab>
                <v-tab>Images<v-icon>image</v-icon></v-tab>
                <v-tab>Logs<v-icon>library_books</v-icon></v-tab>
                <v-tab>Actions<v-icon>touch_app</v-icon></v-tab>

                <v-tab-item style="height: 100%;">
                    <RawDataTab :model="model" :currentTab="currentTab"></RawDataTab>
                </v-tab-item>
                <v-tab-item style="height: 100%;">
                    <CoefficientsTab :metadata="json_metadata" :currentTab="currentTab"></CoefficientsTab>
                </v-tab-item>
                <v-tab-item style="height: 100%;">
                    <FilesTab :modelId="model.model_id" :currentTab="currentTab"></FilesTab>
                </v-tab-item>
                <v-tab-item style="height: 100%;">
                    <ConfigTab :modelId="model.model_id" :currentTab="currentTab"></ConfigTab>
                </v-tab-item>                                
                <v-tab-item style="height: 100%;">
                    <ImagesTab :modelId="model.model_id" :currentTab="currentTab"></ImagesTab>
                </v-tab-item>
                <v-tab-item style="height: 100%;">
                    <LogsTab :model="model" :currentTab="currentTab"></LogsTab>
                </v-tab-item> 
                <v-tab-item style="height: 100%;">
                    <ActionsTab :model="model" :currentTab="currentTab"></ActionsTab>
                </v-tab-item> 
            </v-tabs>
        </v-col>
        </v-row>
    </v-container>
</template>


<style lang="scss">
  .v-tabs {
    .v-tabs-items{
      height: 91% !important;
    }
  }
  .v-tabs-items {
     .v-window__container {
      height: 100% !important;
    }
  }
</style>

<script>
import global_config from './../../../../../config'
import RawDataTab from './tabs/RawData.vue'
import FilesTab from './tabs/Files.vue'
import CoefficientsTab from './tabs/Coefficients.vue'
import ImagesTab from './tabs/Images.vue'
import ActionsTab from './tabs/Actions.vue'
import LogsTab from './tabs/Logs.vue'
import ConfigTab from './tabs/Config.vue'

export default {
    data: () => ({
        currentTab: null
    }),
    props: {
        model: {
            type: Object,
            default: () => {
                return {}
            }
        },
        json_metadata: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    components: {
        RawDataTab,
        FilesTab,
        CoefficientsTab,
        ImagesTab,
        ActionsTab,
        LogsTab,
        ConfigTab
    },
    watch: {
        model: {
            handler(){
                this.fetchFiles();
            },
            immediate: true
        }
    },
    computed: {
        files (){
            return this.$store.getters['files/getFiles'] || [];
        }
    },
    methods: {
        closeDialog(){
            this.$emit('closeDialog');
        },
        tabSwitched(value){
            this.currentTab = value;
        },
        fetchFiles() {            
            this.$store.dispatch('files/queryFileStorage', this.model.model_id).then(function(){
                
                var configs = global_config["file_store_buckets"]["configs"];
                var logs = global_config["file_store_buckets"]["logs"];
                // var imgs = global_config["file_store_buckets"]["imgs"];
                
                if(this.files[logs] && this.files[logs].length > 0){
                    this.$store.dispatch('files/streamFile', {
                        bucket: logs,
                        key: this.files[logs][0]["file_name"],
                        callback_function: 'updateCurrentLoggerFile',
                        loading_commit: 'setLoggerLoading'
                    });
                }
                if(this.files[configs] && this.files[configs].length > 0){
                    this.$store.dispatch('files/streamFile', {
                        bucket: configs,
                        key: this.files[configs][0]["file_name"],
                        callback_function: 'updateCurrentConfigFile',
                        loading_commit: 'setConfigLoading'
                    });
                }
                // if(this.files[imgs] && this.files[imgs].length > 0){
                //     this.$store.dispatch('files/streamImage', {
                //         bucket: imgs,
                //         key: this.files[imgs][0]["file_name"],
                //         callback_function: 'updateCurrentImageFile',
                //         loading_commit: 'setImageLoading'
                //     });
                // }
            }.bind(this));
        },
        copyToClipboard(value){
            navigator.clipboard.writeText(value).then(function() {
                this.$store.commit('snackbar/setSnack', {message: 'Successfully copied to clipboard!', color: 'info'});
            }.bind(this), function() {
                this.$store.commit('snackbar/setSnack', {message: 'Error copying to clipboard!', color: 'error'});
            }.bind(this));
        }
    }
}
</script>

<style>
  .progress-circular-container{
    position: fixed;
    left:50%;
    top:50%;
    margin-left: -35px;
    margin-top: -35px;
    z-index: 10;
  }
</style>