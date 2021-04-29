<template>
     <v-card style="height: 100%;">
        <v-list v-if="coefficients.length > 0">
            <v-list-item v-for="(el, index) in coefficients" :key="index">
                <v-list-item-content>
                    <v-list-item-title>
                        {{el.name}} <span style="color: grey">({{el.original_value}})</span>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        <v-progress-linear color="blue" height="10" v-bind:value="el.value"></v-progress-linear>
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>
        <v-row align="center" justify="center" class="pt-5" v-if="coefficients.length == 0">
            No coefficients found
        </v-row>
    </v-card>        
</template>


<script>

export default {
    data: () => ({
        coefficients: []
    }),
    props: {
        metadata: {
            type: Object,
            default: () => {
                return {}
            }
        },
        currentTab: {
            type: Number,
            default: null
        }
    },
    watch: {
        metadata: {
            handler() {
                this.calculate_coefficients();
            },
            immediate: true
        },
        currentTab: {
            handler(new_value, old_value) {
                if(new_value != old_value){
                    this.calculate_coefficients();
                }
            },
            immediate: true
        }
    },
    methods: {
        calculate_coefficients(){
            var coefficients = [];

            var coefficients_list = Object.keys(this.metadata.models.coefficients || {});

            var max_abs = 0;
            var abs = 0;
            var coefficient_name = "";
            var i = 0;
            
            for (i=0;i<coefficients_list.length;i++){
              coefficient_name = coefficients_list[i];
              abs = Math.abs(this.metadata.models.coefficients[coefficient_name]);
              if (abs>max_abs){
                max_abs = abs;
              }
            }

            for (i=0;i<coefficients_list.length;i++){
              coefficient_name = coefficients_list[i];
              abs = Math.abs(this.metadata.models.coefficients[coefficient_name]);
              coefficients.push(
                {
                  name: coefficient_name,
                  original_value: this.metadata.models.coefficients[coefficient_name],
                  value: abs/max_abs*100
                }
              );
            }

            coefficients.sort(function(a, b) {
              if (a.value < b.value) return 1
              else return -1;
            });     
            this.coefficients = coefficients;
        }
    }
}
</script>
