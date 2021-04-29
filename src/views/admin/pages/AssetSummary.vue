<template>
  <v-container fluid>    
    <v-toolbar class="toolbar-options" flat>
        <div>
          <v-toolbar-title>
            <v-icon class="mt-n1 pr-2">subject</v-icon>
            Asset Summary - {{currentAsset}}
          </v-toolbar-title>
        </div>
      </v-toolbar>      
      <div class="summary-container">
            <div class="card-container">
                <div class="card card-stats">
                    <div class="card-header card-header-rose card-header-icon">
                        <p class="card-category">Number of trained models</p>
                        <h4 class="card-title">{{jobs_stats.train.success}} out of {{jobs_stats.train.total}} tries</h4>
                        <p class="card-category">Average run time of train models</p>
                        <h4 class="card-title">{{jobs_stats.train.avg_time}}s</h4>
                    </div>
                </div>
                <div class="card card-stats">
                    <div class="card-header card-header-rose card-header-icon">
                        <p class="card-category">Number of forecasts</p>
                        <h4 class="card-title">{{jobs_stats.forecast.success}} out of {{jobs_stats.forecast.total}} tries</h4>
                        <p class="card-category">Average run time of forecast models</p>
                        <h4 class="card-title">{{jobs_stats.forecast.avg_time}}s</h4>
                    </div>
                </div>
                <div class="card card-stats" style="cursor:pointer">
                    <div class="card-header card-header-rose card-header-icon" @click="dialogModel(selectedModel)">
                        <p class="card-category">Selected Model</p>
                        <h4 class="card-title">Model Id: {{selectedModel.model_id}}</h4>
                        <h4 class="card-title">Time: {{selectedModel.created_at}}</h4>
                        <!-- <h4 class="card-title">KPIS: {{selectedModel.kpis}}</h4> -->
                    </div>
                </div>
                <div class="card card-stats" style="cursor:pointer">
                    <div class="card-header card-header-rose card-header-icon" @click="dialogModel(lastModel)">
                        <p class="card-category">Most Recent Model</p>
                        <h4 class="card-title">Model Id: {{lastModel.model_id}}</h4>
                        <h4 class="card-title">Time: {{lastModel.created_at}}</h4>
                        <!-- <h4 class="card-title">KPIS: {{selectedModel.kpis}}</h4> -->
                    </div>
                </div>
            </div>
          
            <div class="graphs_con">
              <div class="header">Training</div>
              <v-row dense>
                <v-col
                  v-for="key in Object.keys(training)"
                  :key="key"
                  :cols="3"
                >
                  <v-card>
                    <v-card-title v-text="key"></v-card-title>

                    <ChartJS
                      style="height: 200px; "
                      type="line"
                      :datasets="get_training_values(training, key)"
                      :options="options"
                      :layout="trainLineLayout"
                      :labels="get_training_timeline(training, key)"
                    />
                  </v-card>
                </v-col>
              </v-row>
            </div>
                 
            <br>

            <div class="graphs_con">
              <div class="header">Forecast Drifting</div>              
              <v-row dense>
                <v-col
                  v-for="key in Object.keys(monitoring)"
                  :key="key"
                  :cols="3"
                >
                  <v-card>
                    <v-card-title v-text="key"></v-card-title>

                    <ChartJS
                      style="height: 200px; "
                      type="line"
                      :datasets="get_monitoring_values(monitoring, key)"
                      :options="options"
                      :layout="forecastLineLayout"
                      :labels="get_monitoring_timeline(monitoring, key)"
                    />
                  </v-card>
                </v-col>
              </v-row>
            </div>
      </div>      
      
      <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <ModelProperties :model="current_model" :json_metadata="json_metadata" v-on:closeDialog="closeDialog"></ModelProperties>
     </v-dialog>
    
  </v-container>  
</template>

<style lang="scss" scoped>   
  .card-container{
    display: inline-block;
    width: 100%;
    padding: 30px;
    .card {
        position: relative;        
        margin: 20px 0;
        padding: 15px 0 15px 15px;
        color: #333;
        background: #666;
        width: 25% !important;
        height: 210px;
        float: left;
        display: table;
        box-sizing: border-box;
        > div{
          display: table-cell;
          vertical-align: top;
          border-right: 1px solid #777;
        }
        .card-icon, .card-text {
            border-radius: 3px;
            background-color: #999;
            padding: 15px;
            margin-top: -20px;
            margin-right: 15px;
            float: left;
        }
        .card-header{
            margin: 0 15px;
            padding: 0;
            position: relative;
            i {
                font-size: 36px;
                line-height: 56px;
                width: 56px;
                height: 56px;
                text-align: center;
                color: #fff;
            }
        }      
        .card-category{
            padding-top: 10px;
            margin-bottom: 15px;
        }

        .card-title{
          font-size: 14px;
          font-weight: normal;   
          color: #fff;
          text-shadow: 0px 0px 1px #000;
        }
        &:first-child{
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;
        }
        &:last-child{
          border-top-right-radius: 10px;
          border-bottom-right-radius: 10px;
        }
    }
  }    

  .card.card-stats .card-header.card-header-icon, .card.card-stats .card-header.card-header-text {
      text-align: left;
      padding: 10px
  }

  .card.card-stats .card-header .card-category:not([class*=text-]) {
      color: #ccc;
      font-size: 14px;
  }  

  .card.card-stats .card-header+.card-footer {
      border-top: 1px solid #eee;
      margin-top: 20px;
  }

  .card .card-body+.card-footer, .card .card-footer {
    padding: 10px 0 0;
    margin: 0 15px 10px;
    border-radius: 0;
    justify-content: space-between;
    align-items: center;
  }

  .card .card-footer .author, .card .card-footer .stats {
      display: inline-flex;
      color: #999;
      font-size: 12px;
      line-height: 22px;
  }

  .summary-container{
      position: relative;
      .asset-container 
      {
        border: 1px solid #111;
        padding: 10px;
        width: calc(20% - 28px);
        display: inline-block;
        margin: 14px;
        color: #000;
        border: none;        

        g.curve path {
          stroke: green;
        }
        .v-text-field__details{
          margin: 0 !important;
          padding: 0 !important;    
        }
        .v-input__slot{
          margin: 0;
        }
        .v-select__selections{
          font-size: 12px;
        }
        .v-select__selection--comma {
          color: rgba(0, 0, 0, 1) !important;
          font-weight: bold;
        }
        label {
          color: rgba(0, 0, 0, 0.8) !important;
        }
        .v-select__slot {
            border-bottom: 1px solid #000;
        }
        .theme--dark.v-icon {
          color: #000;
        }     
        .chart-container{
          width: 100% !important;
        }     
      }
      .load_more{
          margin-right: 15px;
          float: right;
          .load_more_text {
            text-decoration: underline;
            cursor: pointer;
          }
      }  
      .complete-box{
        position: absolute;
        width: 100%;
        background-color: #fff;
        border: 3px solid #000;
        z-index: 9;
        .result-option{
          color: #000;
          p{
            margin: 0;
            height: 40px;
            line-height: 40px;
            font-size: 20px;
            padding-left: 5px;
            cursor: pointer;
            &:hover{
              background-color: #eee;
            }
          }
        }
      }  
      .title{
        color: #fff;
      }
  }

  .select-score{
    background-color: #000 !important;
  }   

  .axis-label{
      color: white;
      font-size: 12px;
      margin-left: 25px;
  }

  .graphs_con{
    border: 1px solid #444
  }

  .graphs_con .header{
    padding: 5px;
    color: #fff;
  }

</style>

<script>
  import ChartJS from './../../../components/charts/ChartJS.vue'
  import ModelProperties from './analysis_results/ModelProperties.vue'

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours().toString(),
        minute = d.getMinutes().toString(),
        second = d.getSeconds().toString();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    if (hour.length < 2) 
        hour = '0' + hour;
    if (minute.length < 2) 
        minute = '0' + minute;
    if (second.length < 2) 
        second = '0' + second;

    return [day, month, year].join('/') + " " + [hour, minute, second].join(':');
}

  export default {
    components:{
      ChartJS,
      ModelProperties
    },
    watch: {
      currentAsset: {
          handler() {
            this.$store.dispatch('monitoring/getForecastAccuracyMonitoring', {asset_name: this.currentAsset, asset_label: this.asset_label_name?this.asset_label_name:""});                         
          },
          immediate: true
      }
    },
    data: () => ({
      dialog: false,
      current_model: {},
      json_metadata: {},
      asset_name: "",
      asset_label_name: "",
      trainLineLayout: [
        {
          fill: false,
          label: "Accuracy",
          backgroundColor: "rgba(30,128,240,1)",
          borderColor: "rgba(30,128,240,1)",
          borderWidth: 0.8,
          pointBorderWidth: 0.3,
          pointBackgroundColor: 'transparent',
        }
      ],
      forecastLineLayout: [
        {
          fill: false,
          label: "Accuracy",
          backgroundColor: "rgba(30,128,240,1)",
          borderColor: "rgba(30,128,240,1)",
          borderWidth: 0.8,
          pointBorderWidth: 0.01,
          pointBackgroundColor: 'transparent',
        }
      ],
      options: {
        legend: { display: false },
        scales: {
                yAxes: [{
                    ticks: {
                        fontColor: "white",
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "white",
                    }
                }]
            }
      }
    }),

    computed: {
      jobs_stats (){
        var jobs = this.$store.getters['jobs/getJobs'] || [];
        var jobs_stats = {
          train: {
            success: 0,
            total: 0,
            avg_time: 0
          },
          forecast: {
            success: 0,
            total: 0,
            avg_time: 0
          }
        }

        var total_train_time = 0;
        var total_forecast_time = 0;
        var num_train = 0;
        var num_forecast = 0;

        for (var i=0;i<jobs.length;i++){
          if (jobs[i].data && jobs[i].data[0].asset_name == this.currentAsset){
            var total_time = (new Date(jobs[i].updated_at) - new Date(jobs[i].created_at)) / 1000;
            if (jobs[i].data[0].pipeline == "train"){
              jobs_stats.train.total ++;
              if (jobs[i].status_code == 100){
                jobs_stats.train.success ++;  
                num_train++;
                total_train_time += total_time;              
              }
            }
            else if (jobs[i].data[0].pipeline == "forecast"){
              jobs_stats.forecast.total ++;
              if (jobs[i].status_code == 100){
                jobs_stats.forecast.success ++;  
                num_forecast++;    
                total_forecast_time += total_time;                        
              }
            }
          }
        }
        
        jobs_stats.train.avg_time = num_train == 0 ? 0 : parseInt(total_train_time/num_train);    
        jobs_stats.forecast.avg_time = num_forecast == 0 ? 0 : parseInt(total_forecast_time/num_forecast);    

        return jobs_stats;
      },
      selectedModel(){  
        var selectedModels = this.$store.getters['models/getSelectedModels'];
        if (!selectedModels || selectedModels.length == 0) 
         return {
          model_id: "-",
          created_at: "-"
        };

        var  model_id = "";
        for(var i=0;i<selectedModels.length;i++){
          if (selectedModels[i].asset_name == this.currentAsset){
            model_id = selectedModels[i].model_id;
            break;
          }
        }

        var models = this.$store.getters['models/getModels'];        
        for(var j=0;j<models.length;j++){
          if (models[j].model_id == model_id){
            return models[j];
          }
        }
        return {
          model_id: "-",
          created_at: "-"
        };
      },
      lastModel(){ 
        var models = this.$store.getters['models/getModels'];   
        var clone = JSON.parse(JSON.stringify(models));
        clone.sort(function(a, b) {
          var date_a = new Date(a.created_at);
          var date_b = new Date(b.created_at);
          if (date_b > date_a) return 1
          else return -1;
        });
        for(var j=0;j<clone.length;j++){
          if (clone[j].asset_name == this.currentAsset && clone[j].pipeline == "train"){
            return clone[j];
          }
        }
        return {
          model_id: "-",
          created_at: "-"
        };
      },
      asset_names(){
        return this.$store.getters['models/getAssetNames'];
      },
      model_label_names(){
        return this.$store.getters['models/getAssetLabelNames'];
      },
      model_stats(){
        return this.$store.getters['models/getModelStats'];
      },
      monitoring (){
        var monitoring = this.$store.getters['monitoring/accuracyMonitoring'];
        if (monitoring && monitoring.data){
          return monitoring.data;
        }
        return {};
      },
      currentAsset(){
        return this.$store.getters['templates/getCurrentAsset'] || null;
      },
      training(){
        var models = this.$store.getters['models/getModels'] || [];
        models.sort(function(a, b) {
          var date_a = new Date(a.created_at);
          var date_b = new Date(b.created_at);
          if (date_b < date_a) return 1
          else return -1;
        });
        var currentAsset = this.currentAsset;
        var mapped = models.filter(d => {
            return d.pipeline == "train" && d.asset_name == currentAsset;
          }).map((train) => {
            return {timestamp:train.created_at, values: train.json_metadata.models.scores};
          });
        if(mapped.length==0) return [];
        var keys = Object.keys(mapped[0].values);
        var training = {};
        for(var i=0;i<keys.length;i++){
          training[keys[i]] = [];
          for (var j=0;j<mapped.length;j++){
            training[keys[i]].push({timestamp: formatDate(mapped[j].timestamp), value:mapped[j].values[keys[i]]});
          }
        }                
        return training;
      }
    },

    created () {
      this.initialize();
    },
    mounted () {
    },
    destroyed () {
    },

    methods: {
      initialize () {
        this.$store.dispatch('jobs/fetchJobs');
        this.$store.dispatch('models/fetchAssetNames');    
        this.$store.dispatch('models/fetchTrainModels');    
        this.$store.dispatch('models/fetchModelsHistory')
      },   
      dialogModel(model){
        this.current_model = JSON.parse(JSON.stringify(model));
        this.json_metadata = this.current_model['json_metadata'];
        this.current_model['json_metadata'] = undefined;
        this.dialog = true;
      },
      closeDialog(){
        this.dialog = false;
      },    
       get_training_values (scores, key){
          var values = scores[key].map(function(item) {
              return parseFloat(item.value);
          });      
          return [values];  
      },
      get_training_timeline (scores, key){
          var timestamps = scores[key].map(function(item) {
          return item.timestamp;
          });      
          return timestamps;  
      },
      get_monitoring_values (metrics, key){
        var values = metrics[key].map(function(item) {
          return parseFloat(item.value);
        });      
        return [values];  
      },
      get_monitoring_timeline (metrics, key){
        var timestamps = metrics[key].map(function(item) {
          return item.timestamp;
        });      
        return timestamps;  
      },
      change_asset_name(asset_name) {
       this.$store.dispatch('models/fetchAssetLabelNames', asset_name);
      },
    }
  }
</script>
