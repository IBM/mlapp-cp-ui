<template>
    <v-snackbar class="v-application" v-model="show" :color="color">
      <span class="float-left">{{ message }}</span>
      <v-btn dark text @click="show = false" class="float-right">Close</v-btn>
    </v-snackbar>
</template>

<script>
export default {
    data () {
        return {
            show: false,
            message: '',
            color: 'default'
        }
    },
    created: function () {
        this.$store.watch(state => state.snackbar.snack, () => {
            const msg = this.$store.state.snackbar.snack
            if (msg !== '') {
                this.show = true
                this.message = this.$store.state.snackbar.snack;
                this.color = this.$store.state.snackbar.color;
                this.$store.commit('snackbar/setSnack', {message: '', color: 'default'});
            }
        })
  }
}
</script>