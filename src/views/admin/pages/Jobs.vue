<template>
<div class="job-page">
  <v-data-table
  :footer-props="{
      'items-per-page-options': [25, 50, 100]
    }"
    :items-per-page="25"
    :loading="isLoading" loading-text="Loading... Please wait" dense
    :headers="headers"
    :items="filteredItems"
    :search="search"
    :sort-by.sync="sortingBy"
    :sort-desc.sync="descending"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar class="toolbar-options" flat>
        <div>
          <v-toolbar-title>
            <v-icon class="mt-n1 pr-2">featured_play_list</v-icon>
            Jobs
          </v-toolbar-title>
           <v-flex xs2 style="margin-left: 20px;">
            <v-select v-model="pipeline" :items="available_pipelines" label="Pipeline" hide-details clearable></v-select>
          </v-flex>
          <v-flex xs2>
            <v-select v-model="status_code" :items="available_status_codes" item-text="value" item-value="key" label="Status" dense hide-details clearable></v-select>
          </v-flex>
          <v-flex xs3>
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex xs2 align-self-end class="job-remaining"> 
            <v-badge :value="remaining_queue" color="red" class="float-right"> 
              <template v-slot:badge class="refresh-badge error">
                <span>{{ remaining_queue }}</span>
              </template>
              <v-btn dark @click="refresh()" class="refresh-btn primary">
                <span>Refresh</span>
                <v-icon>refresh</v-icon>
              </v-btn>
            </v-badge>
            <v-btn dark @click="purge()" class="purge-btn float-right">
              <span>Purge</span>
              <v-icon>delete</v-icon>
            </v-btn>
          </v-flex>
        </div>   
      </v-toolbar>
    </template>
    <template v-slot:item="{ item }" @click=dialog()>
      <tr class="table-row" @click="dialogModel(item)">
        <!-- <td>
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on }">
              <div v-on="on">{{ get_substring(item.id, 5) }}</div>
            </template>
            <span>{{ item.id }}</span>
          </v-tooltip>
        </td> -->
        <td>{{ item.user }}</td>
        <td>{{ item.json_data.asset_name }} {{ item.json_data.asset_label }}</td>
        <td>{{ item.schedule_id }}</td>
        <td>{{ item.json_data.pipeline }}</td>
        <!-- <td>{{ item.json_data.asset_label }}</td> -->
        <td>{{ item.json_data.environment }}</td>
        <td>{{ item.json_data.version }}</td>
        <td v-if="item.status_code === -1">
          <v-tooltip bottom color="black" >
            <template v-slot:activator="{ on }">
              <div v-on="on"><v-icon class="status-icon" v-bind:style="{ color: getStatusMeta(item.status_code).color }">{{ getStatusMeta(item.status_code).icon }}</v-icon>{{ getStatusMeta(item.status_code).msg }}: {{ get_substring(item.status_msg, 100) }}</div>
            </template>
            <span>{{ item.status_msg }}</span>
          </v-tooltip>
        </td>
        <td v-if="item.status_code > -1"><v-icon class="status-icon" :class="{'rotating':item.status_code == 1}" v-bind:style="{ color: getStatusMeta(item.status_code).color }">{{ getStatusMeta(item.status_code).icon }}</v-icon>{{ getStatusMeta(item.status_code).msg }}</td>
        <td>{{ item.created_at | moment(timestampFormat()) }}</td>
        
        <td v-if="item.status_code!=0">{{ item.updated_at | moment(timestampFormat()) }}</td>
        <td v-if="item.status_code==0" :class="{'disabled': cancelingJob == true}">
          <!-- <v-btn dark @click="cancel(item)">
            <span>Cancel</span>
            <v-icon>cancel</v-icon>            
          </v-btn> -->
        </td>
      </tr>
    </template>
    <template v-slot:no-data>
      No data is available
    </template>
    <template v-slot:no-results>
        Your search for "{{ search }}" found no results
    </template>
  </v-data-table>

    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <JobData :job="current_job" v-on:closeJobDialog="closeDialog"></JobData>
    </v-dialog>

</div>
</template>

<script>
import JobData from './JobData.vue'
import global_config from './../../../../config'

export default {
  data: () => ({
    dialog: false,
    sortingBy: 'created_at',
    descending: true,
    // asset_name: null,
    asset_label: null,
    environment: null,
    version: null,
    pipeline: null,
    status_code: null,
    schedule_id: null,
    jsonOptions: {modes: ['code', 'tree'], enableSort: false, enableTransform: false},
    headers: [
      { text: 'User', value: 'user'},
      { text: 'Asset Name & Label', value: 'json_data.asset_name'},
      { text: 'Schedule Id', value: 'schedule_id'},  
      { text: 'Pipeline', value: 'json_data.pipeline'},
      // { text: 'Asset Label', value: 'json_data.asset_label', width: '12%'},      
      { text: 'Environment', value: 'json_data.environment'},  
      { text: 'Version', value: 'json_data.version'},                
      { text: 'Status', value: 'status_code'},
      { text: 'Started At', value: 'created_at'},
      { text: 'Ended At', value: 'updated_at'},
    ],
    search: '',
    current_job: {}    
  }),
  components: { 
    JobData
  },
  computed: {
    jobs (){
      var jobs = this.$store.getters['jobs/getJobs'] || [];
      return jobs;
    },
    files (){
      return this.$store.getters['files/getFiles'] || [];
    },
    // redis_logs(){
    //   var logs = this.$store.getters['session/getRedisLogs'] || '';
    //   return logs ? logs.join("\n") : ""; 
    // },    
    config_file(){
      var config_data = this.$store.getters['files/getConfigFile'] || {};
      if (config_data){
        config_data = typeof config_data == "object" ? config_data : JSON.parse(config_data);
      }
      return config_data; 
    },
    isLoggerLoading(){
      return this.$store.getters['files/isLoggerLoading']
    },
    isConfigLoading(){
      return this.$store.getters['files/isConfigLoading']
    },
    available_asset_names (){
      return this.$store.getters['jobs/getAvailableAssetNames'] || [];
    },
    available_asset_labels (){
      return this.$store.getters['jobs/getAvailableAssetLabels'] || [];
    },
    available_environments (){
      return ['dev','staging','production'];
    },
    available_pipelines (){
      return this.$store.getters['jobs/getAvailablePipelines'] || [];
    },
    available_status_codes (){
      var items = [];
      for (var i=0; i < this.$store.getters['jobs/getAvailableStatusCodes'].length; i++){
        var item = this.$store.getters['jobs/getAvailableStatusCodes'][i];
        items.push({key: item, value: this.getStatusMeta(item).msg})
      }
      return items;
    },
    currentAsset(){
      return this.$store.getters['templates/getCurrentAsset'] || null;
    },
    currentEnv(){
      return this.$store.getters['environments/getCurrentEnv'] || null;
    },
    filteredItems() {
      var self = this;
      var filter_by_asset_name = this.jobs.filter((i) => {
        return !self.currentAsset || (i.data && i.data[0].asset_name == self.currentAsset);
      });
      var filter_by_asset_label = filter_by_asset_name.filter((i) => {
        return !self._data.asset_label || (i.data && i.data[0].asset_label == self._data.asset_label);
      });
      var filter_by_environment = filter_by_asset_label.filter((i) => {
        var environment = i.data && i.data[0].environment;
        if(environment == "prod"){
          environment = "production";
        }
        return !self.currentEnv || (environment == self.currentEnv);
      });
      var filter_by_pipeline = filter_by_environment.filter((i) => {
        return !self._data.pipeline || (i.data[0].pipeline == self._data.pipeline);
      });
      var filter_by_status_code = filter_by_pipeline.filter((i) => {
        return !self._data.status_code || (i.status_code.toString() == self._data.status_code.toString());
      });
      return filter_by_status_code;
    },
    remaining_queue (){
      return this.jobs.filter((i) => {
        return i.status_code != "-1" && i.status_code != "100";
      }).length;
    },
    isLoading (){
      return this.$store.getters['jobs/isLoading'];
    },
    cancelingJob(){
      return this.$store.getters['jobs/cancelingJob']
    },
  },
  watch: {
  },
  created () {
    this.initialize()
  },
  methods: {
    initialize () {
      this.$store.dispatch('jobs/fetchJobs')
      this.$store.dispatch('models/fetchModels')
      this.$store.dispatch('models/fetchModelsHistory') 
    },
    getStatusMeta(status_code) {
      var statuses = {
        "1": {msg: "Running", icon: "autorenew", color: "orange"},
        "0": {msg: "In Queue", icon: "query_builder", color: "lightgray"},
        "-1": {msg: "Failed", icon: "error", color: "tomato"},
        "100":{msg: "Complete", icon: "check_circle_outline", color: "green"},
      };
      return statuses[status_code];
    },
    timestampFormat() {
      return "MMM Do YYYY, HH:mm:ss";
    },
    get_substring(text, length){
      return text.substring(0, length) + (length < text.length ? "..." : "");
    },
    dialogModel(job){
      this.current_job = JSON.parse(JSON.stringify(job));
      var prefix_job_id = this.current_job["id"];
      var prefix_model_id = this.current_job["data"] && ((typeof this.current_job['data'] == 'string') ? JSON.parse(this.current_job["data"])[0]["model_id"] : this.current_job["data"][0]["model_id"]);
      
      this.$store.dispatch('files/queryFileStorage', prefix_job_id).then(function(){
        var configs = global_config["file_store_buckets"]["configs"];
        var logs = global_config["file_store_buckets"]["logs"];
        
        
        if(this.files[configs].length > 0){
          this.$store.dispatch('files/streamFile', {
            bucket: configs,
            key: this.files[configs][0]["file_name"],
            callback_function: 'updateCurrentConfigFile',
            loading_commit: 'setConfigLoading'
          });
        }

        if(this.files[logs].length > 0){
          this.$store.dispatch('files/streamFile', {
            bucket: logs,
            key: this.files[logs][0]["file_name"],
            callback_function: 'updateCurrentLoggerFile',
            loading_commit: 'setLoggerLoading'
          });
        }
        else if(prefix_model_id){
          this.$store.dispatch('files/queryFileStorage', prefix_model_id).then(function(){
            var logs = global_config["file_store_buckets"]["logs"];
            if(this.files[logs].length > 0){
              this.$store.dispatch('files/streamFile', {
                bucket: logs,
                key: this.files[logs][0]["file_name"],
                callback_function: 'updateCurrentLoggerFile',
                loading_commit: 'setLoggerLoading'
              });
            }
          }.bind(this))
        }
      }.bind(this))
      
      // var self = this;
      // setInterval(function(){
      //   self.$store.dispatch('session/getLogs', prefix_job_id);
      // },2000)

      // this.$store.dispatch('session/getLogs', prefix_job_id);

      this.dialog = true;
    },
    closeDialog(){
      this.dialog = false;
    },
    purge(){
      confirm('Are you sure you want to purge?') && 
        this.$store.dispatch('queue/purge');     
        // var self = this;
        // setTimeout(function(){
        //   self.refresh();
        // },1000) 
    },
    refresh(){
      this.$store.dispatch('jobs/fetchJobs')       
    },
    cancel(item){      
      this.$store.dispatch('jobs/cancelJob',item)      
      //var self = this;
      // setTimeout(function(){
      //   self.refresh();
      // },1000);
    },
    // refresh_logs(){
    //   var prefix_job_id = this.current_job["id"];
    //   // this.$store.dispatch('session/getLogs', prefix_job_id);
    // }
  }
}
</script>

<style lang="less">
  .disabled{
      opacity: 0.35;
      pointer-events: none;
    }
  #app{
    .v-textarea{
      .v-input__control{
        height: 100%;
        .v-input__slot{
          height: 100%;
          .v-text-field__slot{
            height: 100%;
            textarea{
              color: black;
              height: 100%;
            }
          }
        }
      }
    }
  }
  .table-row{
    cursor: pointer;
  }

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

  .v-toolbar .v-input {
    margin: 0 10px;
  }

  .toolbar-options{
    margin-bottom: 5px;
  }

  .toolbar-options .v-toolbar__content{
      display: block;
      height: auto !important;
  }

  .toolbar-options .v-toolbar__content > div{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px 0;
  }

  .job-remaining{
    .v-badge__badge{
      margin-right: 13px;
    }
  }  

  .purge-btn{
    margin-right: 10px;
  }

  .progress-circular-container{
    position: fixed;
    left:50%;
    top:50%;
    margin-left: -35px;
    margin-top: -35px;
    z-index: 10;
  }

  .status-icon {
    margin-right: 5px;
    padding: 2px 0px;
  }

  @-webkit-keyframes rotating /* Safari and Chrome */ {
    from {
      -webkit-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes rotating {
    from {
      -ms-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -webkit-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to {
      -ms-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -webkit-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  .rotating {
    -webkit-animation: rotating 6s linear infinite;
    -moz-animation: rotating 6s linear infinite;
    -ms-animation: rotating 6s linear infinite;
    -o-animation: rotating 6s linear infinite;
    animation: rotating 6s linear infinite;
  }
</style>
