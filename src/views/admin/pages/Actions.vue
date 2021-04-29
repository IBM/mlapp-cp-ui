<template>
  <v-container fluid>    
    <v-toolbar class="toolbar-options" flat>
        <div>
          <v-toolbar-title>
            <v-icon class="mt-n1 pr-2">subject</v-icon>
            Actions - {{currentAsset}}
          </v-toolbar-title>
        </div>
      </v-toolbar>      
      
      <div style="font-size:30px;padding: 50px;">
          <span style="margin-right:20px;color:#ccc">When</span>
          <select style="color:#ccc">
            <option class="asset-container" :key="key" v-for="key in Object.keys(training)">
                {{key}}           
            </option>
          </select>
          <select style="color:#ccc">
            <option>LESS THAN</option>
            <option>GREATER THAN</option>
          </select>
          <input type="text" style="width:100px;border:1px solid #ccc;background-color:#444;margin-left:20px;">
          <span style="margin-right:20px;color:#ccc;margin-left:20px">Then</span>
      </div> 
      
      
      
    
  </v-container>  
</template>

<style lang="scss" scoped>   
  
</style>

<script>


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
    }),

    computed: {
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
        this.$store.getters['models/getModels'] || [];
      },   
    }
  }
</script>
