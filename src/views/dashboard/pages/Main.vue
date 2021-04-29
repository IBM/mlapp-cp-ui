<template>
  <v-container style="height: 100%;" no-gutters>
    <v-row style="height: 10%;">
      <v-col cols="10">
        <v-flex tag="h2" class="headline">Dashboard</v-flex>
      </v-col>
      <v-col cols="2">
        <v-select xs2 v-model="asset_name" :items="available_asset_names" v-on:change="updateTarget" label="Select Model" single-line hide-details
        style="padding-top: 0px; margin-top: 0px;"></v-select>
      </v-col>
    </v-row>
    <v-row style="height: 90%;">
      <v-col cols="12" style="height: 100%;">
        <v-row style="height: 100%;">
          <v-col cols="7">
            <v-card height="100%">
              <v-list two-line subheader>
                  <v-list-item @click="run_prediction()">
                  <v-list-item-content>
                      <v-list-item-title>Run Prediction</v-list-item-title>
                      <v-list-item-subtitle>Use selected model for running your forecast</v-list-item-subtitle>
                  </v-list-item-content>
                  </v-list-item>
                  <v-subheader>Analysis</v-subheader>
                  <v-list-item>
                    <ChartJS 
                      style="height: 250px; width: 50%"
                      type="line"
                      :datasets="lineData"
                      :layout="lineLayout"
                      :labels="lineLabels"
                    />
                    <ChartJS
                      style="height: 250px; width: 50%"
                      type="pie"
                      :options="{ cutoutPercentage: 80 }"
                      :datasets="pieData"
                      :layout="pieLayout"
                      :labels="pieLabels"
                    />
                  </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="5" style="height: 100%;">
            <v-card height="100%">
              <v-simple-table fixed-header height="100%" width="100%">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-center">Index</th>
                      <th class="text-center">Actual</th>
                      <th class="text-center">Prediction</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in target" :key="item.index">
                      <td class="text-center">{{ item.index }}</td>
                      <td class="text-center">{{ item.y_true }}</td>
                      <td class="text-center">{{ item.y_hat }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card>
          </v-col>          
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ChartJS from './../../../components/charts/ChartJS.vue'

export default {
  name: 'Main',
  components:{
    ChartJS
  },
  data: () => ({
    asset_name: null,
    sub_asset_name: null,

    // line chart
    lineLayout: [
      {
        fill: false,
        label: "Actuals",
        backgroundColor: "green",
        borderColor: "green"
      },
      {
        fill: false,
        label: "Predictions",
        backgroundColor: "#3f51b5",
        borderColor: "#3f51b5"
      }
    ],
    // pie chart
    pieLayout: [{backgroundColor: ["green", "#3f51b5"]}],
    pieLabels: ["Smaller Than 100", "Larger Than 100"]
  }),
  computed:{    
    template() {
      return this.$store.getters['templates/getTemplateByName'] || {};
    },
    available_asset_names (){
      return this.$store.getters['models/getAvailableAssetNames'] || [];
    },
    target(){
      return this.$store.getters['target/getTarget'] || [];
    },
    pieData(){
      if(this.target.length == 0){
        return [];
      }
      var under100 = 0;
      var above100 = 0;
      for(var i = 0; i < this.target.length; i++){
        var value = this.target[i]['y_true']
        if(value < 100){
          under100 = under100 + value;
        }
        else{
          above100 = above100 + value;
        }
      }
      return [[under100, above100]];
    },
    lineData(){
      if(this.target.length == 0){
        return [];
      }

      var actuals = [];
      var predictions = [];
      for(var i = 0; i < this.target.length && i < 10; i++){
        actuals.push(this.target[i]['y_true'])
        predictions.push(this.target[i]['y_hat'])
      }
      return [actuals, predictions];
    },
    lineLabels(){
      if(this.target.length == 0){
        return [];
      }

      var indexes = [];
      for(var i = 0; i < this.target.length && i < 10; i++){
        indexes.push(this.target[i]['index'])
      }
      return indexes;
    }
  },
  watch: {
    available_asset_names(new_value){
      this.asset_name = new_value && new_value[0];
      this.updateTarget();
    }
  },
  created(){
    this.initialize();
  },
  methods:{
    initialize (){
      this.$store.dispatch('models/fetchModels');
    },
    updateTarget(){
      this.$store.dispatch('target/fetchTarget', {
        asset_name: this.$data.asset_name, 
        sub_asset_name: this.$data.sub_asset_name, 
        type_id: 2
      });
    }
  }
}
</script>

<style lang="scss" scoped>
  .v-data-table{
    height: 100%;
  }  
</style>
