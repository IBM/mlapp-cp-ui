<template>
  <div>
  <v-app id="inspire">
    <v-content>
      <v-container fluid fill-height>
        <div class="bg" :style="{ backgroundImage: `url(${background_image})` }"></div>
        <v-layout align-center justify-center>
          <!-- <v-flex> -->
            <v-card class="elevation-1" style="width: 450px; padding: 0px 10px 10px 10px; padding-bottom: 15px;">
              <!-- <v-toolbar dark color="indigo">
                <v-toolbar-title>Login form</v-toolbar-title>
              </v-toolbar> -->
              <v-card-text>
                <div style="width: 100%; text-align: center; padding: 5px 0px;">
                  <img v-bind:src="getLogo()" class="text-xs-right" style="height: 50px;" />
                  <div style="width: 100%; font-size: 18px; padding: 15px 0px;">MLApp Control Panel</div>
                </div>
                <v-form>
                  <v-text-field v-model="login" name="login" label="Email" type="text"></v-text-field>
                  <v-text-field v-model="password" name="password" label="Password" id="password" type="password" v-on:keyup.enter="inputPress()"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-progress-circular v-if="loading" indeterminate style="margin-right: 20px;"></v-progress-circular>
                <span style="margin-right: 15px; color: tomato;" v-if="loginErrorMsg">{{ loginErrorMsg }}</span>
                <v-btn dark @click="logIn()">Sign In</v-btn>
              </v-card-actions>
            </v-card>
          <!-- </v-flex> -->
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
  </div>  
</template>

<script>
import global_config from './../../../config'
import axios from 'axios'

export default {
  name: 'Login',
  data: () => ({
    loading: false,
    loginErrorMsg: "",
    login: '',
    password: '',
    background_image: global_config.app.background_image
  }),
  components: { 
     
  },
  methods: {
    getLogo() {
      return global_config['app']['logo'];
    },
    inputPress(){
      this.logIn();
    },
    logIn() {
      var self = this;
      self.loading = true;
      self.loginErrorMsg = "";
      axios.post(global_config["api"]["base_url"] + "/auth/login", {user: this.login, password: this.password})
          .then(function(response) {
              if (response.status !== 200) {
                console.error("Login error")
                self.loginErrorMsg = response.data.error;
                self.loading = false;
              }
              else {
                localStorage.setItem("auth-token", response.data.token);
                window.location.href = "/";
              }
          })
          .catch(function(err) { console.error(err); }); /* eslint-disable-line no-console */
    }
  }
}
</script>

<style>

  .progress-circular-container{
    position: fixed;
    left:50%;
    top:50%;
    margin-left: -35px;
    margin-top: -35px;
    z-index: 10;
  }

  .bg{
    background-size: cover;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  .theme--light.v-card{
      background-color: rgba(255,255,255,0.94) !important;
  }
</style>