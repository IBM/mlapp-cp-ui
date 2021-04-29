<template>
  <v-app v-show="show_app">

    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <!-- <ListTile title="Summary" icon="view_list" url="/admin"></ListTile> -->
        <!-- <ListTile title="Activity" icon="bar_chart" url="/admin/activity"></ListTile> -->
        <ListTile title="Users" icon="person" url="/users"></ListTile>
        <!-- <ListTile title="Permissions" icon="lock" url="/admin/permissions"></ListTile> -->
        <!-- <ListTile title="Data Insights" icon="perm_data_setting" url="/admin/data-insights"></ListTile> -->
        <ListTile title="Assets" icon="computer" url="/"></ListTile>
        <ListTile title="Run" icon="play_arrow" url="/run"></ListTile>
        <ListTile title="Results" icon="insert_chart" url="/results"></ListTile>
        <ListTile title="Jobs" icon="featured_play_list" url="/jobs"></ListTile>
        <!-- <ListTile title="Map" icon="map" url="/map"></ListTile> -->
        <ListTile title="Asset Summary" icon="assessment" url="/asset-summary"></ListTile>
        <ListTile title="Scheduler" icon="schedule" url="/scheduler"></ListTile>
        <!-- <ListTile title="Actions" icon="build" url="/actions"></ListTile> -->
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <img v-bind:src="getLogo()" height="30" class="text-xs-right" style="padding-right: 15px; padding-left: 5px;" />
      <v-toolbar-title>Machine Learning Control Panel</v-toolbar-title>
      <v-spacer></v-spacer>
      <b>Asset:&nbsp;</b>
      <v-select v-model="selected_asset_name" 
            @change="updateAssetName($event)" 
            :items="available_asset_names" 
            label="Asset" 
            style="width: 300px !important; max-width: 300px !important; margin-right: 10px;"
            single-line hide-details clearable></v-select>
      
      <div v-show="getDeployment == 'ibmcloud'">
      <b>Env:&nbsp;</b>
      <v-select v-model="selected_environment" 
            @change="updateEnvironment($event)" 
            style="width: 200px !important; max-width: 200px !important; margin-right: 10px;"
            :items="available_environments" 
            label="Env" single-line hide-details clearable></v-select>
        <div class="version_con"><div><span style="margin: 0 10px;"><b>Dev: </b></span> <span style="color: #fff;">v{{versions.dev.value}}</span><span v-show="versions.dev.value!=versions.dev.updating_to" class="updating_to_lbl"> (Updating to v{{versions.dev.updating_to}})</span></div></div>        
        <div class="version_con"><div><span style="margin: 0 10px;"><b>Staging: </b></span> <span style="color: #fff;">v{{versions.staging.value}}</span><span v-show="versions.staging.value!=versions.staging.updating_to" class="updating_to_lbl"> (Updating to v{{versions.staging.updating_to}})</span></div></div>
        <div class="version_con"><div><span style="margin: 0 10px;"><b>Prod: </b></span> <span style="color: #fff;">v{{versions.prod.value}}</span><span v-show="versions.prod.value!=versions.prod.updating_to" class="updating_to_lbl"> (Updating to v{{versions.prod.updating_to}})</span></div></div>
      </div>
      <div v-show="getDeployment != 'ibmcloud'">
        <div class="version_con">
          <span style="margin: 0 10px;"><b>Env:</b></span>
          <span style="color: #fff;">{{ selected_environment }} &nbsp;</span>
        </div>        
      </div>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>account_circle</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <!-- <ListTile title="Back to Dashboard" url="/dashboard"></ListTile> -->
            <ListTile title="Logout" url="logout"></ListTile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <v-container fluid>
          <router-view></router-view>
      </v-container>
    </v-content>


    <!-- <v-footer app>
      <span>&copy; 2019</span>
      <span class="version-label">ver. {{getVersion()}}</span>
    </v-footer> -->

  </v-app>
</template>

<script>
import global_config from './../../../config'
import ListTile from '../../components/layout/ListTile.vue'

export default {
  name: 'Layout',
  data: () => ({
    drawer: false,
    show_app: false,
    selected_asset_name: null,
    selected_environment: null
  }),
  components: { 
    ListTile 
  },
  computed: {
    versions (){
        return this.$store.getters['environments/getVersions'];
    },
    available_asset_names (){
      return this.$store.getters['templates/getAvailableAssetsNames'] || [];
    },
    available_environments (){
      return ['dev','staging','production']; 
    },
    currentAsset(){
      return this.$store.getters['templates/getCurrentAsset'] || null;
    },
    currentEnv(){
      return this.$store.getters['environments/getCurrentEnv'] || null;
    },
    getDeployment(){
      return global_config.deployment
    }
  },
  methods: {
    initialize() {
      this.$store.dispatch('templates/fetchTemplates');
      this.selected_environment = this.$store.getters['environments/getCurrentEnv'];
    },
    getLogo() {
      return global_config['app']['logo'];
    },
    getVersion() {
      return global_config['app']['version'];
    },
    updateAssetName() {
      this.$store.dispatch('templates/updateAssetName', this.selected_asset_name);
    },
    updateEnvironment() {
      this.$store.dispatch('environments/updateEnv', this.selected_environment);
    }     
  },
  watch: {
    currentAsset(new_value){
      this.selected_asset_name = new_value;
    },
    currentEnv(new_value){
      this.selected_environment = new_value;
    },
  },
  created() {
    this.initialize()
    this.$vuetify.theme.dark = true;
    this.$store.dispatch('environments/getVersions')
  },
  mounted(){
    this.show_app = true;
  }
}
</script>

<style lang="scss">
// json-editor
.jsoneditor-poweredBy {
  display: none !important;
}

.ace_gutter, .ace_layer .ace_gutter-layer{
  z-index: 0 !important;
}

.jsoneditor-outer, .jsoneditor-menu, .jsoneditor {
    background-color: #212121 !important;
    border:1px solid #212121 !important;
}

.version-label{
   margin-left: 20px !important;
}
.updating_to_lbl{
  color: orange;
  font-size: 14px;
}

.version_con{
  display: inline-block;
  font-size: 14px;
}

.version_con > div{
  display: table;
  border-spacing: 8px 0
}

.version_con > div > span{
  display: table-cell;
  vertical-align: middle;
}

</style>