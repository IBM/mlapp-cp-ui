<template>
    <div style="height: 100%;">
        <div class="progress-circular-container">
            <v-progress-circular v-if="isLoggerLoading" :size="70" :width="7" indeterminate></v-progress-circular>
        </div>
      <v-card height="100%" v-if="!isLoggerLoading">
          <v-card-text style="height:100%;">
              <v-row style="height: 100%;">
                <v-col cols="12">
                  <v-textarea
                    style="height: 100%; padding: 20px;"
                    background-color="white"
                    color="blue"
                    readonly
                    v-model="logger_file"
                  ></v-textarea>
                </v-col>
              </v-row>
          </v-card-text>
      </v-card>
    </div>
</template>


<script>

export default {
    data: () => ({
        // json editor options
        raw_data: {}
    }),
    props: {
        modelId: {
            type: String,
            default: null
        },
        currentTab: {
            type: Number,
            default: null
        }
    },
    computed: {
        logger_file(){
            return this.$store.getters['files/getLoggerFile'] || ''; 
        },
        isLoggerLoading(){
            return this.$store.getters['files/isLoggerLoading']
        }
    },
    components: {
    }
}
</script>

<style lang="less">
  #app{
    .v-textarea{
      .v-input__control{
        height: 100%;
        .v-input__slot{
          height: 100%;
          .v-text-field__slot{
            height: 100%;
            textarea{
              color: black;
              height: 100%;
            }
          }
        }
      }
    }
  }
</style>