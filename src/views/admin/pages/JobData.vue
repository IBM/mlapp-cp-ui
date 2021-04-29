<template>
    <v-container fluid style="height:100%; padding: 0px;">
        <v-row no-gutters style="height: 60px;">
        <v-col cols="12">
            <v-toolbar class="blue">
                <v-icon class="mr-2">perm_data_setting</v-icon>
                <v-toolbar-title>Job Id: {{job.id }} </v-toolbar-title>
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
                <v-tab>Logs<v-icon>library_books</v-icon></v-tab>
                <v-tab>Config<v-icon>settings</v-icon></v-tab>

                <v-tab-item style="height: 100%;">
                  <div :currentTab="currentTab" class="progress-circular-container">
                    <v-progress-circular v-if="isLoggerLoading" :size="70" :width="7" indeterminate></v-progress-circular>
                  </div>
                  <v-card height="100%" v-if="!isLoggerLoading">
                    <v-textarea
                      style="height: 100%; padding: 20px; margin-top: 0px;"
                      background-color="white"
                      color="blue"
                      readonly
                      v-model="logger_file"
                    ></v-textarea>
                    
                    <!-- <v-btn style="margin: 10px 20px 0px 20px;float: right;" v-show="current_job.status_code==1" v-on="on" @click="refresh_logs()">Refresh</v-btn> -->

                    <!-- <v-textarea v-show="current_job.status_code==1"
                      style="height: 100%; padding: 20px; margin-top: 0px;clear:both"
                      background-color="white"
                      color="blue"
                      readonly
                      v-model="redis_logs"
                    ></v-textarea> -->
                  </v-card>
                </v-tab-item>
                <v-tab-item style="height: 100%;">
                  <div :currentTab="currentTab" class="progress-circular-container">
                    <v-progress-circular v-if="isConfigLoading" :size="70" :width="7" indeterminate></v-progress-circular>
                  </div>
                  <v-card height="100%" v-if="!isConfigLoading">
                    <JsonEditor v-model="config_file" :options="jsonOptions" style="height: 100%;"></JsonEditor>
                  </v-card>
                </v-tab-item>
            </v-tabs>
        </v-col>
        </v-row>
    </v-container>
</template>

<script>
import JsonEditor from './../../../components/forms/JsonEditor.vue'

export default {
    data: () => ({
        currentTab: null,
        current_job: {},
        // json editor options
        jsonOptions: {modes: ['code', 'tree'], enableSort: false, enableTransform: false, onEditable: function(){ return false; }},
    }),
    props: {
        job: {
            type: Object,
            default: () => {
                return {}
            }
        },
        modelId: {
            type: String,
            default: null
        },
    },
    computed: {
        config_file(){
            var config_data = this.$store.getters['files/getConfigFile'] || ''; 
            if (config_data){
                return JSON.parse(config_data);
            }
            return {}
        },
        isLoggerLoading(){
            return this.$store.getters['files/isLoggerLoading']
        },
        isConfigLoading(){
            return this.$store.getters['files/isConfigLoading']
        },
        logger_file(){
            return this.$store.getters['files/getLoggerFile'] || ''; 
        }, 
    },
    components: {
        JsonEditor
    },
    methods: {
        closeDialog(){
            this.$emit('closeJobDialog');
        },
        tabSwitched(value){
            this.currentTab = value;
        },
    }
    
}
</script>