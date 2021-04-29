<template>
  <v-app id="inspire" style="height: 100%;">

    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <ListTile icon="dashboard" title="Dashboard" url="/dashboard"></ListTile>
        <!-- <ListTile icon="map" title="Map" url="/dashboard/map"></ListTile> -->
        <!-- <ListTile icon="settings" title="Self Service Portal" url="/dashboard/self-service-portal"></ListTile> -->
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left dark color="indigo">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <img src="../../assets/ibm_logo_white.png" height="30" class="text-xs-right" style="padding-right: 15px; padding-left: 5px; width: 100px;" />
      <v-toolbar-title>RAD-ML Machine Learning Control Panel</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>account_circle</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <ListTile title="Admin" url="/"></ListTile>
            <ListTile title="Logout" url="logout"></ListTile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>

    <v-content style="height: 100%;"> 
      <v-container fluid style="height: 100%;" no-gutters>
        <v-row style="height: 100%;" no-gutters>
          <v-col style="height: 100%;">
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-content>


    <v-footer app fixed dark color="indigo">
      <span>&copy; 2019</span>
      <span class="version-label">ver. {{getVersion()}}</span>
    </v-footer>

  </v-app>
</template>

<script>
import global_config from './../../../config'

import ListTile from '../../components/layout/ListTile.vue'

export default {
  name: 'Layout',
  data: () => ({
    drawer: false
  }),
  components: { 
    ListTile 
  },
  methods: {
    getVersion() {
      return global_config['app']['version'];
    }
  },
  created () {
    this.$vuetify.theme.dark = false;
  }
}
</script>
