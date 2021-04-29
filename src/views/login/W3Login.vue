<template>
  <div>
  <v-app id="inspire">
    <v-content>
      <v-container fluid fill-height>
        
        <!-- <v-layout class="bg" align-center justify-center :style="{ backgroundImage: `url(${background_image})` }"> -->
        <v-layout class="bg" align-center justify-center style="background: #333333">
           <div style="width: 400px;">
            <div class="lelevation-1" style="background-color:#333;padding:20px;box-sizing:border-box; border-radius: 3px; border: 1px solid #555555;">
                 <img class="client-logo text-xs-right" v-bind:src="getLogo()" style="display: block; margin: 10px auto; max-height: 50px; max-width: 300px;"/>
                <div class="login-head" style="font-size: 20px; text-align:center;margin: 10px auto;color:#fff">Machine Learning Control Panel</div>
                <div layout="column" style="text-align:center;margin: 10px auto;" layout-align="center center" class="login-container layout-align-center-center layout-column">
                    <div class="login-content" aria-hidden="false">
                        <div class="submit" aria-hidden="false">
                            <!-- <v-card color="transparent" class="elevation-12"> -->
                              <v-card-actions class="justify-center">
                                <v-btn color="white" class="black--text" dark @click="logIn">Single Sign-On Login</v-btn>
                              </v-card-actions>
                            <!-- </v-card> -->
                        </div>
                        <div style="margin-top: 8px;">
                            <a href="#" style="color: #aaa;" @click="logIn()">Request access</a>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
  </div>
</template>

<script>
import global_config from './../../../config'
export default {
  name: 'Login',
  data: () => ({
    background_image: global_config.app.background_image
  }),
  components: { 
     
  },
  methods: {
    logIn(){      
      location.href = global_config["api"]["base_url"] + "/auth/sso"
    },
    getLogo() {
      return global_config['app']['logo'];
    },
  }
}
</script>

<style>
  .bg{
    background-size: cover;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
</style>