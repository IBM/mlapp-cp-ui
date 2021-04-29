<template>
<div>
    <v-toolbar flat style="padding-bottom: 10px;">
      <v-toolbar-title>
          <v-icon class="mt-n1 pr-2">play_arrow</v-icon>
          Run
      </v-toolbar-title>
      <v-flex xs2 style="margin-left: 30px; margin-top: 15px;">
        <v-select labels="options" label="Config Input" v-model="selected_upload_option" :items="upload_options" hide-details></v-select>
      </v-flex>
      <!-- <v-flex xs2 style="margin-right: 10px;" :class="{'none':selected_upload_option!=upload_options[0]}">
        <v-select labels="models" v-model="selected_asset_name" :items="available_asset_names" @change="updateCurrentAssetName($event)" single-line hide-details></v-select>
      </v-flex> -->
       <v-flex xs2 :class="{'disabled': selected_upload_option!=upload_options[0]}" style="margin-left: 20px; margin-top: 15px;">
        <v-select labels="pipelines_templates" label="Pipeline" v-model="selected_pipeline_name" :items="available_pipeline_names" @change="updateCurrentPipelineName($event)" hide-details></v-select>
      </v-flex>
    </v-toolbar>
    <v-stepper :class="{'disabled': selected_pipeline_name == null}" v-model="currentStep" v-if="selected_upload_option==upload_options[0]">
      <v-stepper-header style="background-color: #424242">
            <v-stepper-step :key="`data`" :step="1" editable>
              Data Settings
            </v-stepper-step>
            <v-divider></v-divider>

            <v-stepper-step :key="`model`" :step="2" editable>
              Model Settings
            </v-stepper-step>
            <v-divider></v-divider>

            <v-stepper-step :key="`job`" :step="3" editable>
              Job Settings
            </v-stepper-step>
            <v-divider></v-divider>

            <v-stepper-step :key="`json`" :complete="true" :step="4" editable>
              Full JSON
            </v-stepper-step>
        </v-stepper-header>
      <v-divider></v-divider>
      <v-stepper-items style="background-color: #424242">
        <v-stepper-content :key="`data`" :step="1">
          <JsonEditor v-model="data_settings_config" :options="jsonOptions" :height="`420px`"></JsonEditor>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="nextStep()">
              Continue
            </v-btn>
          </v-card-actions>
        </v-stepper-content>

        <v-stepper-content :key="`model`" :step="2">
          <JsonEditor v-model="model_settings_config" :options="jsonOptions" :height="`420px`"></JsonEditor>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="nextStep()">
              Continue
            </v-btn>
          </v-card-actions>
        </v-stepper-content>

        <v-stepper-content :key="`job`" :step="3">
          <JsonEditor v-model="job_settings_config" :options="jsonOptions" :height="`420px`"></JsonEditor>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="nextStep()">
              Continue
            </v-btn>
          </v-card-actions>
        </v-stepper-content>

        <v-stepper-content :key="`json`" :step="4">
          <JsonEditor v-model="full_config" :options="jsonOptions" :height="`420px`"></JsonEditor>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="dialog = true">
              Add Config AutoGen
            </v-btn>
            <v-btn color="primary" @click="sendJob()">
              Run {{ countCombinations(generator_config) }} Job{{ countCombinations(generator_config) > 1 ? "s" : "" }}
            </v-btn>
          </v-card-actions>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <v-content v-if="selected_upload_option==upload_options[1]" style="padding:10px; background-color: #424242">
      <v-file-input
          v-model="files"
          color="blue accent-4"
          counter
          label="File input"
          multiple
          placeholder="Select your files"
          prepend-icon="mdi-paperclip"
          outlined
          :show-size="1000"
        >
          <template v-slot:selection="{ index, text }">
            <v-chip
              v-if="index < 2"
              color="blue accent-4"
              dark
              label
              small
            >
              {{ text }}
            </v-chip>

            <span
              v-else-if="index === 2"
              class="overline grey--text text--darken-3 mx-2"
            >
              +{{ files.length - 2 }} File(s)
            </span>
          </template>
        </v-file-input>
        <v-btn color="primary" @click="uploadFile()" style="float:right">
          Run Configs
        </v-btn>
    </v-content>

<v-dialog v-model="dialog" width="80%">
  <v-card>
    <v-card-title>
      <span class="headline">Configuration AutoGen</span>
    </v-card-title>
    <v-card-text>
      <p>Generate and submit many jobs to the queue by specifying lists of config properties below. A train job will be submitted for every combination of the options, combined with the config in the main editor.</p>
      <p>For example, specifying <b>{"job_settings.market": ["North America", "Latin America"]}</b> will run two jobs - one with market set to "North America", and the other with market set to "Latin America".</p>
      <v-container>
        <v-row>
          <v-col cols="12">
              <JsonEditor v-model="generator_config" :options="jsonOptions" :height="`350px`"></JsonEditor>                      
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="clear_generator">Clear</v-btn>
      <v-btn text @click="add_generator">Add</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</div>
</template>

<script>
import JsonEditor from './../../../components/forms/JsonEditor.vue'

export default {
  name: 'TrainModels',
  data: () => ({
    full_config: {
      "pipelines_configs": [{
        "data_settings": {},
        "model_settings": {},
        "job_settings": {}
      }]
    },
    data_settings_config: {},
    model_settings_config: {},
    job_settings_config: {},
    jsonOptions: {modes: ['code', 'tree'], enableSort: false, enableTransform: false},
    // selected_asset_name: null,
    selected_pipeline_name: null,
    selected_template: null,
    generator_config: {},
    use_generator: false,
    dialog: false,
    currentStep: 4,
    totalSteps: 4,
    upload_options: ["Config From Template", "Config From Files"],
    selected_upload_option: "Config From Template",
    files: null
  }),
  components: { 
    JsonEditor
  },
  computed: {
    currentTemplate() {
      return this.$store.getters['templates/getTemplateByAssetNameAndPipelineName'] || {};
    },
    available_pipeline_names() {
      var pipeline_templates = this.$store.getters['templates/getAvailablePipelineTemplates'] || {};
      return Object.keys(pipeline_templates);
    },
    currentPipeline(){
      return this.$store.getters['templates/getCurrentPipeline'] || null;
    },
    currentEnv(){
      return this.$store.getters['environments/getCurrentEnv'] || null;
    },
  },
  watch: {
    selected_template(new_value){      
      this.full_config = JSON.parse(JSON.stringify(new_value));
      this.data_settings_config = this.full_config && this.full_config.pipelines_configs && this.full_config.pipelines_configs[0]["data_settings"] || {};
      this.model_settings_config = this.full_config && this.full_config.pipelines_configs && this.full_config.pipelines_configs[0]["model_settings"] || {};
      this.job_settings_config = this.full_config && this.full_config.pipelines_configs && this.full_config.pipelines_configs[0]["job_settings"] || {};       
    },
    currentStep(new_value, old_value){
      if(old_value != 4 && new_value == 4){
        this.full_config = {
          pipelines_configs: [{
            data_settings: this.data_settings_config,
            model_settings: this.model_settings_config,
            job_settings: this.job_settings_config,
          }]
        }
      }
      if(old_value == 4 && new_value != 4){
        this.data_settings_config = this.full_config && this.full_config.pipelines_configs && this.full_config.pipelines_configs[0]["data_settings"] || {};
        this.model_settings_config = this.full_config && this.full_config.pipelines_configs && this.full_config.pipelines_configs[0]["model_settings"] || {};
        this.job_settings_config = this.full_config && this.full_config.pipelines_configs && this.full_config.pipelines_configs[0]["job_settings"] || {}; 
      }
    },
    currentPipeline(new_value){
      this.selected_pipeline_name = new_value;
    },
    currentTemplate(new_value){
      this.selected_template = new_value
    }
    // currentAsset(new_value){
    //   this.selected_asset_name = new_value;
    //   this.selected_pipeline_name = this.$store.getters['templates/getCurrentPipeline'];
    // }
  },
  created() {
    this.initialize()
  },
  methods: {
    nextStep() {
      this.currentStep++;
    },
    sendJob() {
      var msg = {
          config: this.$data.full_config,
          env: this.currentEnv
      }
      if(this.use_generator){
        msg["generator"] = this.$data.generator_config,
        this.$store.dispatch('queue/sendConfigGenerator', msg);
      }
      else{
        this.$store.dispatch('queue/sendMessage', msg);
      }
      
    },
    initialize() {
      // this.$store.dispatch('templates/updateAssetName', this.selected_asset_name);
      // this.$store.dispatch('templates/updatePipelineName', this.selected_pipeline_name);
      if (!this.selected_pipeline_name) this.selected_pipeline_name = this.$store.getters['templates/getCurrentPipeline'];
      if (!this.selected_template) this.selected_template = this.$store.getters['templates/getTemplateByAssetNameAndPipelineName'] || {}
      // this.$store.dispatch('templates/fetchTemplates');
    },
    // updateCurrentAssetName(){
    //   this.currentStep = 4;
    //   this.$store.dispatch('templates/updateAssetName', this.selected_asset_name);
    // },
    updateCurrentPipelineName(){
      this.currentStep = 4;
      this.$store.dispatch('templates/updatePipelineName', this.selected_pipeline_name);
    },
    clear_generator(){
      this.dialog = false;
      this.generator_config = {};
      this.use_generator = false;
    },
    add_generator(){
      this.dialog = false;
      this.use_generator = true;
    },
    countCombinations(obj) {
      var keys = Object.keys(obj);
      var count = 1;
      keys.forEach(function(key) {
        count = count * obj[key].length;
      })
      return count;
    },
    uploadFile() {
      this.$store.dispatch('queue/sendFiles', this.files)           
    }
  }
}
</script>

<style scoped>
    .disabled{
      opacity: 0.35;
      pointer-events: none;
    }
    .none{
      display: none;
    }
    .v-stepper {
      border-radius: 0px;
    }
</style>