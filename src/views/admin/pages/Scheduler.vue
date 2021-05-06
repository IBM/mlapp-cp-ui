<template>
  <div>
      <v-toolbar class="scheduler-toolbar" flat>
        <v-toolbar-title>
          <v-icon class="mt-n1 pr-2">schedule</v-icon>
          Scheduler
        </v-toolbar-title>
        <v-flex xs2 style="margin-left: 20px;">
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-flex>
        <v-spacer></v-spacer>
        <div class="flex-grow-1"></div>
        <v-dialog v-model="dialog" @close="close" width="80%">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on">Add a new scheduled job</v-btn>
          </template>      
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            
            <v-card-text>
              <v-container>
                  <div>
                    <!-- <div style="margin:10px;display:inline-block;">
                      <input type="radio" id="simple_configuration" value="simple_configuration" v-model="picked_schedule">
                      <label for="simple_configuration" style="margin-left:10px">Simple Configuration</label>
                    </div> -->

                    <!-- <div style="margin:10px;display:inline-block;">
                      <input type="radio" id="cron_command" value="cron_command" v-model="picked_schedule">
                      <label for="cron_command" style="margin-left:10px">Cron Command</label>
                    </div> -->


                  </div>
                  
<!-- 
                  <div :class="{'none':picked_schedule=='cron_command'}" class="cron_container">
                    <div>
                      <v-text-field xs2 v-model="editedItem.name" label="Name" single-line hide-details clearable></v-text-field>                  
                      <v-select xs2 v-model="editedItem.schedule_conf.intrval" :items="intrval_values" label="Frequency" single-line hide-details clearable></v-select>
                      <v-select xs2 v-model="editedItem.schedule_conf.unit" :items="intrval_unit" label="Unit" single-line hide-details clearable></v-select>
                    </div>          
                    <br>
                    <JsonEditor v-model="editedItem.config" :options="jsonOptions" :height="`350px`"></JsonEditor>
                  </div> -->

                  <div class="cron_container">
                    <div>
                      <v-container>
                        <v-row>
                          <v-col cols="5">
                            <v-text-field xs2 v-model="editedItem.name" label="Scheduler Name" hide-details clearable></v-text-field>
                          </v-col>
                          <v-col cols="1"></v-col>
                        </v-row>
                        <v-row>&nbsp;</v-row>
                        <v-row>
                          <v-col cols="5">
                            <v-text-field xs2 v-model="editedItem.schedule_conf.command" label="Scheduler Cron Expression" hide-details clearable></v-text-field>                      
                          </v-col>
                          <v-col cols="1">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                <div style="position: relative;display: inline-block;border-radius: 10px;width: 20px;height: 20px;background-color: #fff; margin-top:5px;">
                                  <a target="_blank" style="position: absolute;width: 100%;text-align: center;line-height: 20px;color: rgb(0, 0, 0);text-decoration: none;" href="https://crontab.guru/" v-on="on">i</a>
                                </div>
                              </template>
                              <span>Cron Expression Helper</span>
                            </v-tooltip>
                            
                          </v-col>
                        </v-row>
                        <v-row>&nbsp;</v-row>
                        <v-row>
                          <span style="font-size: 16px;">Scheduler Config</span>
                        </v-row>
                        <v-row>
                          <JsonEditor v-model="editedItem.config" :options="jsonOptions" :height="`350px`"></JsonEditor>      
                        </v-row>
                      </v-container>
                      
                                      

                      <div style="margin-top:15px;">
                        <span>Triggers when model finish:</span>
                        
                        <div class="asset-container">
                            <div style="display:table;width:100%">
                              <div style="display:table-cell;background-color: #ddd;color: #222;width:45%;border:1px solid #999;padding:15px">
                                Conditions
                              </div>
                              <div style="display:table-cell;background-color: #ddd;color: #222;width:45%;border:1px solid #999;padding:15px">
                                Actions
                              </div>   
                              <div style="display:table-cell;background-color: #ddd;color: #222;width:10%;border:1px solid #999;padding:15px;text-align:center">
                                Delete  
                              </div>                              
                            </div>
                        </div>
                        <div class="asset-container" :key="index" v-for="(trigger,index) in triggers">
                            <div class="trigger_row" style="display:table;width:100%;cursor:pointer">
                              <div style="display:table-cell;width:45%;border:1px solid #777;padding:15px">
                                {{parse_conditions_as_text(trigger.conditions.list)}}
                              </div>
                              <div style="display:table-cell;width:45%;border:1px solid #777;padding:15px">
                                {{parse_trigger_as_text(trigger.triggers)}}
                              </div>   
                              <div style="display:table-cell;width:10%;border:1px solid #777;padding:15px;text-align:center">
                                <div @click="deleteTrigger(index)"><v-icon>delete</v-icon></div>  
                              </div>                             
                            </div>
                        </div>

                        <div style="border:1px solid #777;margin-top:15px;padding:15px;">
                          <v-btn @click="show_add_trigger=true">
                              <span>+ Add Trigger</span>
                          </v-btn>  
                          <div v-show="show_add_trigger">
                            <div style="margin:10px">
                              <div>
                                <v-row>
                                  <v-col cols="3">
                                    <v-checkbox v-model="send_mail" label="Send Email" color="primary"></v-checkbox>
                                  </v-col>
                                  <v-col cols="9">
                                    <v-text-field v-model="email_address" label="Email address"></v-text-field>
                                  </v-col>
                                </v-row>
                              </div>
                              <div>
                                <v-row>
                                  <v-col cols="3">
                                    <v-checkbox v-model="promote_to_prod" label="Promote to Prod" color="primary"></v-checkbox>
                                  </v-col>
                                </v-row>
                              </div>                              
                            </div>

                            <div> 
                              <div>
                                <div style="margin:10px">
                                      <div>Conditions:</div>
                                      <div style="float:left;margin-right:15px;" :key="index" v-for="(condition,index) in temp_conditions">
                                          <div style="display: inline-block;padding: 5px;margin: 10px 0px;border:1px solid #ccc;">
                                            <div style="display:table;border-spacing:4px;">
                                               <div style="display:table-cell;vertical-align:middle">{{parse_condition_as_text(condition)}}</div>
                                              <div style="display:table-cell;vertical-align:middle;"><div @click="deleteTempItem(index)"><v-icon>delete</v-icon></div> </div>
                                            </div>  
                                          </div>
                                      </div>

                                      <div style="clear:both;">
                                        <v-flex xs2 style="margin-right: 10px;">
                                          <v-select v-model="asset_score" :items="asset_scores" label="KPI" single-line hide-details clearable></v-select>
                                        </v-flex>
                                        <v-flex xs2 style="margin-right: 10px;">
                                          <v-select v-model="condition" :items="conditions" label="CONDITION" single-line hide-details clearable></v-select>
                                        </v-flex>
                                        <v-flex xs2 style="margin-right: 10px;">
                                          <v-text-field v-model="kpi_val" label="Value" single-line hide-details></v-text-field>
                                        </v-flex>
                                      </div>
                                </div>
                              </div>    
                              <v-btn :class="{'disabled': (asset_score=='' | condition=='' | kpi_val=='')}" @click="add_temp_condition">
                                  <span>+ Add Condition</span>
                              </v-btn>                     
                            </div>
                            
                          </div>                                                
                        </div>


                        <!-- <v-textarea style="border:1px solid #fff" xs2 v-model="editedItem.schedule_conf.trigger" label="Trigger" single-line hide-details clearable></v-textarea>                                     -->

                      </div>
                    </div>          
                  </div>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="close">Cancel</v-btn>
              <v-btn text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>            
        </v-toolbar>      
      
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
      <template v-slot:item="{ item }">
        <tr class="table-row">
          <td>{{ item.name }}</td>
          <td>{{ item.schedule_conf.command }}</td>   
          <td @click="showJob(item.lastJob)" style="cursor:pointer">{{ formatDate(item.lastJob && item.lastJob.created_at) }}</td>   
          <td>
            <v-icon @click="editItem(item)">edit</v-icon>
            <v-icon @click="deleteItem(item)">delete</v-icon>
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

    <v-dialog v-model="job_dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <JobData :job="current_job" v-on:closeJobDialog="closeJobDialog"></JobData>
    </v-dialog>

  </div>
</template>

<style lang="scss" scoped>   
    .disabled{
      opacity: 0.35;
      pointer-events: none;
    }
    .none{
      display: none;
    }

    .col, .v-input{
      margin: 0 0 5px 0;
      padding: 0;
    }

    .trigger_row:hover{
      background-color: #666;
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


</style>

<script>

  // import global_config from './../../../../config'
  import JobData from './JobData.vue'
  import JsonEditor from './../../../components/forms/JsonEditor.vue'

  export default {
    components:{
      JobData,
      JsonEditor
    },
    data: () => ({
        dialog: false,     
        job_dialog: false,    
        show_add_trigger: false,
        defaultItem: { 
          name: null,
          schedule_conf: {
            intrval: null,
            unit: null,
            command: null
          },
         },   
        picked_schedule: 'cron_command',        
        intrval_values: [],
        intrval_unit: ['Minutes','Hours','Days'],                
        sortingBy: 'created_at',
        descending: true,
        jsonOptions: {modes: ['code', 'tree'], enableSort: false, enableTransform: false},
        headers: [
          { text: 'Name', value: 'name', width: '25%'},
          { text: 'Cron Command', value: 'schedule_conf.command', width: '25%'},
          { text: 'Last Job', value: 'lastJob.id', width: '25%'},
          { text: 'Actions', value: '', width: '25%'},
        ],
        search: '',
        editedIndex: -1,
        editedItem: {
          name: null,
          schedule_conf: {
            intrval: null,
            unit: null,
            command: null
          },
          config: {}
        },
        asset_scores: [],
        conditions: ["LESS THAN","GREATER THAN","EQUALS"],
        send_mail: false,
        email_address: "",
        promote_to_prod: false,
        asset_score: "",
        condition: "",     
        kpi_val: "",   
        triggers: [],
        temp_conditions: [],  
        current_job: {}    
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Create A New Scheduled Job' : 'Edit Scheduled Job'
      },
      currentAsset(){
        return this.$store.getters['templates/getCurrentAsset'] || null;
      },
      config_json: {
          get(){
            if (this.editedItem.config)
              return (typeof this.editedItem.config === 'string') ? JSON.parse(this.editedItem.config) : this.editedItem.config;
            return {};
          },
          set(newVal){
              //this function will run whenever the input changes          
            this.editedItem.config = JSON.stringify(newVal);
          }
      },
      schedules (){
        var schedules = this.$store.getters['scheduler/getSchedules'] || [];
        return schedules;
      },
      filteredItems() {     
        return this.schedules; 
      },
      isLoading (){
        return this.$store.getters['scheduler/isLoading'];
      }      
    },
    watch: {
      currentAsset(new_value){
        this.$store.dispatch('models/fetchTrainModelsByAssetName',new_value);
      },
      dialog(val) {
        val || this.close();
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
          for (var i=1;i<=100;i++){
            this.intrval_values.push(i);
          }

          this.$store.dispatch('scheduler/fetchSchedules')
      }, 
      dialogModel(){
        this.dialog = true;
      },
      closeDialog(){
        this.dialog = false;
      },
      editItem (item) {
        this.asset_scores = this.$store.getters['models/getAvailableAccuracies'];
                
        this.editedIndex = this.schedules.indexOf(item)
        this.editedItem = Object.assign({}, item)      

        for (var i=0;i<this.schedules.length;i++){
          if (this.schedules[i].id == item.id){          
            this.editedItem.name = this.schedules[i].name;
            this.editedItem.schedule_conf = this.schedules[i].schedule_conf;
            this.editedItem.config = this.schedules[i].config;
            if (this.editedItem.schedule_conf.command){
              this.picked_schedule = "cron_command";
            }
            else{
              this.picked_schedule = "simple_configuration";              
            }
            break;
          }
        }
        
        this.triggers = JSON.parse(item && item.schedule_conf && item.schedule_conf.trigger || "[]");
        
        this.dialog = true;
      },

      showJob (item) {                
        this.current_job = JSON.parse(JSON.stringify(item));
        this.job_dialog = true;
      },

      closeJobDialog(){
        this.job_dialog = false;
      },

      deleteItem (item) {
        event.stopPropagation();
        this.$store.dispatch('scheduler/deleteSchedule', {id: item.id})
      },

      close () {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1;
          this.triggers = [];
          this.temp_conditions = [];
        }, 300)
      },

      build_trigger_json (){
        var triggers_json = {
          triggers: [],
          conditions: {
            operator: "AND",
            list: []
          }
        }
        
        if (this.send_mail){
          triggers_json.triggers.push({
            type: "email",
            value: this.email_address,          
          })
        }

        if (this.promote_to_prod){
          triggers_json.triggers.push({
            type: "promote",
            value: "prod",          
          })
        }

        triggers_json.conditions = {
          operator: "AND",
          list: this.temp_conditions
        };        

        if(triggers_json.triggers.length > 0){
          this.triggers.push(triggers_json);
        }
        
        return this.triggers;
      },

      parse_trigger_as_text (triggers){
        var str = "";
        for (var i=0;i<triggers.length;i++){
          if (triggers[i].type == "email"){
            str += "Email: " + triggers[i].value;
          }
          else if (triggers[i].type == "promote"){
            str += "Promote to: " + triggers[i].value;
          }
          if (i<triggers.length-1){
            str += ", ";
          }
        }

        return str;
      },

      parse_conditions_as_text (conditions_list){
        var str = "";
        for (var i=0;i<conditions_list.length;i++){
          str += this.parse_condition_as_text(conditions_list[i])
          if (i<conditions_list.length-1){
            str += ", ";
          }
        }

        return str;
      },

      parse_condition_as_text (condition){
        return (condition.key + " " +  condition.condition + " " + condition.value);
      },

      deleteTrigger (index){
        this.triggers.splice(index,1);
      },

      deleteTempItem (index){
        this.temp_conditions.splice(index,1);
      },

      add_temp_condition () {
        this.temp_conditions.push({
          "key": this.asset_score,
          "value": this.kpi_val,
          "condition": this.condition
        })
        this.asset_score = "";
        this.kpi_val = "";
        this.condition = "";
      },

      save () {      
        this.build_trigger_json();        
        if (this.editedIndex > -1) {        
          this.editedItem.schedule_conf.trigger = JSON.stringify(this.triggers);
          this.$store.dispatch('scheduler/updateSchedule', this.editedItem);
        } 
        else {
          if (this.picked_schedule == "simple_configuration"){
            delete this.editedItem.schedule_conf.command;
          }
          else if (this.picked_schedule == "cron_command"){
            delete this.editedItem.schedule_conf.intrval;
            delete this.editedItem.schedule_conf.unit;
          }
          this.$store.dispatch('scheduler/createSchedule', {
              name: this.editedItem.name,
              schedule_conf: this.editedItem.schedule_conf,
              config: this.editedItem.config
            });    
        }
        
        this.close()
      },
     
     formatDate (date) {  
       if (date == null){
         return '-'
       }
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

    }
  }
</script>
