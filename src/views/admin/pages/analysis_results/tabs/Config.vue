<template>
    <div style="height: 100%;">
        <div class="progress-circular-container">
            <v-progress-circular v-if="isConfigLoading" :size="70" :width="7" indeterminate></v-progress-circular>
        </div>
        <v-card height="100%" v-if="!isConfigLoading">
            <v-card-text style="height:100%;">
                <JsonEditor v-model="config_file" :options="jsonOptions" style="height: 100%;"></JsonEditor>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import JsonEditor from './../../../../../components/forms/JsonEditor.vue'

export default {
    data: () => ({
        // json editor options
        jsonOptions: {modes: ['code', 'tree'], enableSort: false, enableTransform: false, onEditable: function(){ return false; }},
    }),
    props: {
        modelId: {
            type: String,
            default: null
        },
        currentTab: {
            type: Number,
            default: null
        }
    },
    computed: {
        config_file(){
            var config_data = this.$store.getters['files/getConfigFile'] || ''; 
            if (config_data){
                return JSON.parse(config_data);
            }
            return {}
        },
        isConfigLoading(){
            return this.$store.getters['files/isConfigLoading']
        }
    },
    components: {
        JsonEditor
    },
    methods: {
    }
    
}
</script>