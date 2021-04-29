<template>
    <v-card height="100%">
        <v-list two-line subheader>
            <v-subheader>General Actions</v-subheader>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>                    
                    <v-btn v-show="environment == 'dev'" color="primary" @click="retrain_in_staging(model)">
                        <span>Retrain in Staging</span>
                    </v-btn>  
                    <v-btn style="margin-right: 10px;" v-show="environment == 'dev' || (environment == 'staging' && get_staging_version()!=model.json_properties.deploy_version)" color="primary" @click="change_staging_version(model)">
                        <span>Change staging environment to version {{model.json_properties.deploy_version}}</span>
                    </v-btn>  
                    <v-btn v-show="environment == 'staging'" color="primary" @click="deploy_to_production(model)">
                        <span>Deploy to Production</span>
                    </v-btn>  
                    <v-btn v-show="environment == 'default' || environment == 'local'" color="primary" @click="select_model(model)">
                        <span>Select as Best Model</span>
                    </v-btn>                
                    </v-list-item-title>                
                    <!-- <v-list-item-subtitle>Make this the default model for forecasts of type '{{ current_asset_name }}'</v-list-item-subtitle> -->
                </v-list-item-content>
            </v-list-item>
            <v-subheader>Run Pipeline</v-subheader>
            <v-list-item>
                <v-list-item-content>
                    <div>
                        <v-list-item-title>
                            <v-select
                            :items="Object.values(pipelines)"
                            label="Choose Pipeline"
                            v-model="selected_pipeline"
                            @change="updatePipeline($event)"
                            solo
                            ></v-select>
                            <v-btn color="primary" @click="sendJob()">
                                <span>Run</span>
                            </v-btn>                
                        </v-list-item-title>                
                        <v-list-item-subtitle>Change the config below to your liking and make a {{selected_pipeline}} using this model</v-list-item-subtitle>
                    </div>
                    <div>
                        <JsonEditor v-model="forecast_config" :options="forecastJsonOptions" style="height: 100%;"></JsonEditor>
                    </div>
                </v-list-item-content>
            </v-list-item>            
        </v-list>
    </v-card>        
</template>

<style scoped>
    .v-list-item{
        border: 1px solid #777;
        margin: 10px;
    }
    .v-list-item__title{
        margin-bottom: 15px;
    }
    .v-list-item__subtitle{
        margin-bottom: 15px;
    }
</style>

<script>
import JsonEditor from './../../../../../components/forms/JsonEditor.vue'

var enumPipelines = {
    'Forecast': 'forecast',
    'Retrain': 'retrain',            
}

var defaultPipeline = enumPipelines.Forecast;

export default {
    data: () => ({
        // json editor options
        forecastJsonOptions: {modes: ['code', 'tree'], enableSort: false, enableTransform: false},
        
        pipelines: enumPipelines,

        selected_pipeline: defaultPipeline,

        // forecast configurations
        pipeline_config_default: {
            pipelines_configs: [
                {
                    data_settings: {},
                    model_settings: {},
                    job_settings: {
                        pipeline: defaultPipeline,
                        asset_name: "asset_name",
                        model_id: ""
                    }
                }
            ]
        },
        forecast_config: {},

        // display variables
        current_asset_name: '',
    }),
    props: {
        model: {
            type: Object,
            default: () => {
                return {}
            }
        },
        currentTab: {
            type: Number,
            default: null
        }
    },
    watch: {
        model: {
            handler() {
                this.update_model_data();
            },
            immediate: true
        },
        currentTab: {
            handler(new_value, old_value) {
                if(new_value != old_value){    
                    this.update_model_data();
                }
            },
            immediate: true
        }
    },
    components: {
        JsonEditor
    },
    computed: {
        config_file(){
            var config_data = this.$store.getters['files/getConfigFile'] || ''; 
            if (config_data){
                return JSON.parse(config_data);
            }
            return {}
        },
        environment() {
            return this.model.environment;
        }
    },
    methods: {
        updatePipeline(){
            this.pipeline_config_default = {
                pipelines_configs: [
                    {
                        data_settings: {},
                        model_settings: {},
                        job_settings: {
                            pipeline: this.selected_pipeline,
                            asset_name: "asset_name",
                            model_id: ""
                        }
                    }
                ]
            }
            this.update_model_data();
        },        
        sendJob() {
            var msg = {
                config: this.$data.forecast_config,
                env: this.environment
            }
            this.$store.dispatch('queue/sendMessage', msg);
        },
        update_model_data(){
            this.current_asset_name = this.model.asset_name;
            this.forecast_config = JSON.parse(JSON.stringify(this.pipeline_config_default));
            this.forecast_config['pipelines_configs'][0]['job_settings']['asset_name'] = this.model.asset_name;
            this.forecast_config['pipelines_configs'][0]['job_settings']['model_id'] = this.model.model_id;
        },
        deploy_to_production (current_model) {
            var data_to_send = {
                "current_model": current_model,
                "toolchain": {
                    from: "staging", 
                    to: "prod"
                }
            }
            this.$store.dispatch('models/selectModel', data_to_send);
        },
        select_model(current_model){
            var data_to_send = {
                "current_model": current_model,
                "toolchain": {
                    from: this.environment, 
                    to: this.environment
                }
            }
            this.$store.dispatch('models/selectModel', data_to_send);
        },
        retrain_in_staging(current_model) {
            var data_to_send = {
                "config": {"pipelines_configs": [this.config_file]},
                "deploy_version": current_model.json_properties.deploy_version,
                "toolchain": {
                    from: "dev", 
                    to: "staging"
                },
                "env": "staging"
            }
            this.$store.dispatch('queue/sendMessage', data_to_send);
            
        },
        change_staging_version (current_model) {            
            this.$store.dispatch('toolchain/changeStagingVersion', {
                model_id: current_model.model_id,
                version: current_model.json_properties.deploy_version
            });   
        },
        get_staging_version(){
            var versions = this.$store.getters['environments/getVersions'];
            return versions["staging"].value;
        }
    }
}
</script>
