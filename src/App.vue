<template>
  <div id="app" style="height: 100%;">
    <router-view />
    <Snackbar />
  </div>
</template>

<script>
import Snackbar from './components/layout/Snackbar.vue'
export default {
  components: {
    Snackbar
  },
  methods: {
    check_status(){
      let uri = window.location.search.substring(1); 
      let params = new URLSearchParams(uri);
      let status = params.get("request_status")
      if(status == "2") this.$store.dispatch('snackbar/setSuccess', 'Request access succesfully. Wait for administrator to approve your request');   
      if(status == "3") this.$store.dispatch('snackbar/setError', 'There was an error with requesting access. Please contact administrator.');
    }
  },
  mounted() {
    this.check_status();
  }
}
</script>

<style>
  div.jsoneditor-field{
    color: #fff !important;
  }
</style>