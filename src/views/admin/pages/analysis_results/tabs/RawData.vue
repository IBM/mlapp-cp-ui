<template>
    <v-card height="100%">
        <v-card-text style="height:100%;">
            <JsonEditor v-model="raw_data" :options="jsonOptions" style="height: 100%;"></JsonEditor>
        </v-card-text>
    </v-card>
</template>


<script>
import JsonEditor from './../../../../../components/forms/JsonEditor.vue'

export default {
    data: () => ({
        // json editor options
        jsonOptions: {modes: ['code', 'tree'], enableSort: false, enableTransform: false, onEditable: function(){ return false; }},
        raw_data: {}
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
    components: {
        JsonEditor
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
    methods: {
        update_model_data(){
            this.raw_data = JSON.parse(JSON.stringify(this.model));
            this.raw_data.metadata = (typeof this.raw_data.metadata === 'string') ? JSON.parse(this.raw_data.metadata) : this.raw_data.metadata;
            this.raw_data.properties = (typeof this.raw_data.properties === 'string') ? JSON.parse(this.raw_data.properties) : this.raw_data.properties;
        }
    }
    
}
</script>
