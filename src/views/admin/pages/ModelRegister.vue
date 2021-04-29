<template>
  <v-data-table
  :footer-props="{
      'items-per-page-options': [25, 50, 100]
    }"
    :items-per-page="25"
    :loading="isLoading" loading-text="Loading... Please wait"
    :headers="headers"
    :items="filteredItems"
    :sort-by.sync="sortingBy"
    :sort-desc.sync="descending"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon class="mt-n1 pr-2">computer</v-icon>
          Assets
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="flex-grow-1"></div>
        <v-flex xs2>
          <v-switch
            style="margin-top: 25px; margin-left: 30px;"
            v-model="enable_filter"
            color="info"
            :label="`Show disabled assets`"
          ></v-switch>
        </v-flex>
        <v-dialog v-model="dialog" width="80%">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="register_new_asset()">Register A New Asset</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="9">
                    <v-text-field v-model="editedItem.name" label="Asset Name"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-checkbox v-model="editedItem.enabled" label="Enabled" color="primary"></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    
                    <v-tabs background-color="black accent-4" v-model="pipeline_index" dark>
                      <v-tab v-for="(name, index) in pipeline_items" :key="index" @click="updateCurrentPipeline(name)">{{name}}</v-tab>
                    </v-tabs>
    
                    <div style="margin-top: -42px;margin-right: 5px;float: right;">
                        <v-btn color="primary" @click="addNewPipeline">+ Register A New Pipeline</v-btn>
                    </div>

                  </v-col>
                </v-row>

                <div v-if="editedItem.pipeline">

                  <v-row>
                    <p>Pipeline Name:</p>
                    <v-col cols="12">
                      <input type="text" style="height:40px;line-height:40px;font-size:20px;width:100%;background-color:#fff;color:#000;border:1px solid #000;padding-left:20px" v-model="editedItem.pipeline">
                    </v-col>
                  </v-row>

                  <v-row>
                    <p>Pipeline Config:</p>
                    <v-col cols="12">
                        <JsonEditor v-model="template_json" :options="jsonOptions" :height="`350px`"></JsonEditor>
                    </v-col>
                  </v-row>

                </div>

              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="deletePipeline">Delete Pipeline</v-btn>              
              <v-btn text @click="close">Cancel</v-btn>
              <v-btn color="primary" @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.name="{ item }">
      <span @click="editItem(item, 'name')" style="padding-bottom:3px; cursor: pointer">{{ item.name }}</span>
    </template>
    <template v-slot:item.template="{ item }">
      <span @click="editItem(item, 'template')" style="padding-bottom:3px; cursor: pointer">{{ Object.keys(item.pipeline_templates).join(", ") }}</span>
    </template>
    <template v-slot:item.enabled="{ item }">
      <span @click="editItem(item, 'enabled')" style="padding-bottom:3px; cursor: pointer">{{ item.enabled == 1 }}</span>
    </template>
    <template v-slot:item.action="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
      <v-icon small @click="deleteItem(item)">delete</v-icon>
    </template>
    <template v-slot:no-data>
      No data is available
    </template>
    <template v-slot:no-results>
        Your search for "{{ search }}" found no results
    </template>
  </v-data-table>
</template>

<script>
import JsonEditor from './../../../components/forms/JsonEditor.vue'

export default {
  data: () => ({
    dialog: false,
    sortingBy: 'enabled',
    descending: true,
    jsonOptions: {modes: ['code', 'tree'], enableSort: false, enableTransform: false},
    headers: [
      { text: 'Asset Name', value: 'name', width: '15%'},
      { text: 'Available Pipelines', value: 'template', width: '30%' },
      // { text: 'Default Forecast Config', value: 'template', width: '30%' },
      { text: 'Enabled', value: 'enabled', width: '15%' },
      { text: 'Actions', value: 'action' , width: '5%', sortable: false}
    ],
    search: '',
    editedIndex: -1,
    editedItem: {},
    pipeline: '',
    pipeline_items: [],
    pipeline_index: 0,
    defaultItem: { enabled: true },
    enable_filter: 0,
    last_pipeline_name: ""
  }),
  components: {
    JsonEditor
  },
  computed: {
    template_json: {
        get(){          
          if (this.editedItem.template)
            return (typeof this.editedItem.template === 'string') ? JSON.parse(this.editedItem.template) : this.editedItem.template;
          return {};
        },
        set(newVal){
            //this function will run whenever the input changes          
           this.editedItem.template = JSON.stringify(newVal);
        }
    },
    formTitle () {
      return this.editedIndex === -1 ? 'Register A New Asset' : 'Edit Registered Asset'
    },
    templates (){
      return this.$store.getters['templates/getTemplates'] || [];
    },
    statusesList (state){
      return Object.keys(state.statuses).map((key) => { return {'id': key, 'name': state.statuses[key]} });
    },
    filteredItems(state) {
      return this.templates.filter((i) => {
        return state.enable_filter == 1 || i.enabled;
      })
    },    
    isLoading (){
      return this.$store.getters['templates/isLoading'];
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    initialize () {
      this.$store.dispatch('templates/fetchTemplates')
    },

    register_new_asset(){
      this.pipeline_items = [];
      this.editedItem.enabled = 1; 
    },

    updateCurrentPipeline(name){
      this.editedItem.pipeline = name;
      this.pipeline_index = this.pipeline_items.indexOf(this.editedItem.pipeline);
      this.last_pipeline_name = this.editedItem.pipeline;
      for (var i=0;i<this.templates.length;i++){
        if (this.templates[i].name == this.editedItem.name){          
          this.editedItem.template = this.templates[i].pipeline_templates[this.editedItem.pipeline];
          break;
        }
      }
    },

    addNewPipeline(){
      var new_pipeline_name = "new_pipeline_"+Date.now();
      this.editedItem.pipeline = new_pipeline_name;        
      this.pipeline_items.push(new_pipeline_name);      
      this.updateCurrentPipeline(new_pipeline_name)           
      this.last_pipeline_name = "";
      this.pipeline_index = this.pipeline_items.indexOf(this.editedItem.pipeline);
    },

    deletePipeline(){
      this.pipeline_items.splice(this.pipeline_index,1);      
      delete this.editedItem.pipeline_templates[this.editedItem.pipeline];

      this.pipeline_index = 0;
      var first_pipeline_name = this.pipeline_items[this.pipeline_index];
      this.editedItem.pipeline = first_pipeline_name;      
      this.updateCurrentPipeline(first_pipeline_name)           
    },

    editItem (item) {
      this.editedIndex = this.templates.indexOf(item)
      this.editedItem = Object.assign({}, item)
      //this.editedItem.template_json = JSON.parse(this.editedItem.template);

      for (var i=0;i<this.templates.length;i++){
        if (this.templates[i].name == item.name){          
          this.pipeline_items = Object.keys(this.templates[i].pipeline_templates);
          break;
        }
      }

      this.editedItem.pipeline = this.pipeline_items[0];
      this.pipeline_index = this.pipeline_items.indexOf(this.editedItem.pipeline);
      this.last_pipeline_name = this.editedItem.pipeline;
      this.editedItem.template = this.editedItem.pipeline_templates[this.editedItem.pipeline];
      
      this.dialog = true
    },

    get_substring(text, length){
      return text.substring(0,length) + (length < text.length ? "..." : "");
    },

    deleteItem (item) {
      confirm('Are you sure you want to delete template "' + item.name + '"?') &&
        this.$store.dispatch('templates/deleteTemplate', item);
        this.$store.dispatch('files/deleteFilesOfAsset', item);
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      var pipeline_templates
      if (this.editedIndex > -1) {        
        pipeline_templates = this.editedItem.pipeline_templates || {};

        if (pipeline_templates[this.editedItem.pipeline] == null){
          delete this.editedItem.pipeline_templates[this.last_pipeline_name];
        }
        
        pipeline_templates[this.editedItem.pipeline] = this.editedItem.template;

        this.editedItem.pipeline_templates = pipeline_templates;        
        this.$store.dispatch('templates/updateTemplate', this.editedItem);
      } 
      else {
        // dispatch create model
        pipeline_templates = this.editedItem.pipeline_templates || {};
        pipeline_templates[this.editedItem.pipeline] = this.editedItem.template;
        this.editedItem.pipeline_templates = pipeline_templates;
        
        this.$store.dispatch('templates/createTemplate', this.editedItem);
      }
      this.close()
    },
  }
}
</script>

<style scoped lang="scss">

  .pipeline_item{
    display: inline-block;
    padding: 10px;
    background-color: #777;
    margin: 12px 12px 12px 0;
    cursor: pointer;
    &.selected{
      background-color: #000;
    }
    &.add_new{
      background-color: #1e80f0;
    }
  }
  .pipeline_name{
    color:#fff;
  }
</style>