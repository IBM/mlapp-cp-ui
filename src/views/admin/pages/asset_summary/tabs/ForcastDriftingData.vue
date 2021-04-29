<template>
     <v-card style="height: 100%;">
        <div class="asset-container" :key="key" v-for="key in Object.keys(monitoring.data)">
            <v-row align="center" justify="center">
                <v-col class="d-flex">
                    <p class="axis-label">{{key}}</p>
                </v-col>
            </v-row>
            
            <ChartJS
              style="height: 250px; width: 50%"
              type="line"
              :datasets="get_monitoring_values(monitoring.data, key)"
              :options="options"
              :layout="lineLayout"
              :labels="get_monitoring_timeline(monitoring.data, key)"
            />

            <div style="float:right">
                <v-row align="center" justify="center">
                    <v-col class="d-flex">
                        <p class="axis-label">Time</p>
                    </v-col>
                </v-row>
            </div>
        </div>
    </v-card>        
</template>

<style lang="scss" scoped>   
  .card-container{
    display: inline-block;
    margin-left: 10px;
    width: 24%;
    .card {
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        border: 0;
        margin-bottom: 30px;
        margin-top: 30px;
        padding: 15px 0;
        border-radius: 6px;
        color: #333;
        background: #fff;
        width: 100%;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
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
            margin-bottom: 0;
        }

        .card-title{
          font-size: 1.5625rem;
          line-height: 1.4em; 
          font-family: Roboto,Helvetica,Arial,sans-serif;
          font-weight: 300;   
        }
    }
  }    

  .card.card-stats .card-header.card-header-icon, .card.card-stats .card-header.card-header-text {
      text-align: right;
  }

  .card.card-stats .card-header .card-category:not([class*=text-]) {
      color: #999;
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
        padding: 10px;
        width: calc(20% - 28px);
        display: inline-block;
        margin: 14px;
        color: #000;
            border-radius: 0 !important;

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

  .select-metric{
    background-color: #000 !important;
  }   

  .axis-label{
      color: #666;
      font-size: 12px;
      margin-left: 25px;
  }

</style>

<script>
  import ChartJS from './../../../../../components/charts/ChartJS.vue'
  
  export default {
        components:{
            ChartJS,
        },
        watch: {
          currentAsset: {
            handler() {
              this.run();
            },
            immediate: true
            }
        },
        data: () => ({
            currentTab: null,
            asset_name: "",
            asset_label_name: "",
            lineLayout: [
                {
                  fill: false,
                  label: "",
                  backgroundColor: "transparent",
                  borderColor: "green"
                }
            ],
            options: {
              legend: { display: false }
            }
        }),
        computed: {
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
                return this.$store.getters['monitoring/accuracyMonitoring'] || {};
            },
            currentAsset(){
                return this.$store.getters['templates/getCurrentAsset'] || null;
            },
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
            }, 
            tabSwitched(value){
                this.currentTab = value;
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
            run() {
               this.$store.dispatch('monitoring/getForecastAccuracyMonitoring', {asset_name: this.currentAsset, asset_label: this.asset_label_name?this.asset_label_name:""});                         
            },
        }
   }

</script>