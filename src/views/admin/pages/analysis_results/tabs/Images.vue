<template>
    <v-card height="100%">
        <v-carousel v-if="images.length > 0" style="min-height: 100%; max-height: 100%;" v-model="current_index">
            <v-carousel-item v-for="(file, index) in images" :key="index" style="height: 100%;">
                <div class="progress-circular-container">
                    <v-progress-circular v-if="isImageLoading" :size="70" :width="7" indeterminate></v-progress-circular>
                </div>
                <v-row align="center" justify="center" v-if="!isImageLoading">
                    <img v-bind:src="dataUrl()" style="width:50%;height:auto;" />
                </v-row>
            </v-carousel-item>
        </v-carousel>
        <v-row align="center" justify="center" class="pt-5" v-if="images.length == 0">
            No images found
        </v-row>
    </v-card>
</template>


<script>
import global_config from './../../../../../../config'

export default {
    data: () => ({
        img_bucket: global_config["file_store_buckets"]["imgs"],
        current_index: 0
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
    watch: {
        current_index(new_value){
            this.streamImage(new_value);
            this.current_index = new_value;
        },
        images(new_value){
            if(new_value && new_value.length){
                this.$store.dispatch('files/streamImage', {
                    bucket: this.img_bucket,
                    key: this.images[0].file_name,
                    callback_function: 'updateCurrentImageFile',
                    loading_commit: 'setImageLoading'
                });
            }
        }
    },
    computed: {   
        image_file(){
            return this.$store.getters['files/getImageFile'] || ''; 
        },
        isImageLoading(){
            return this.$store.getters['files/isImageLoading']
        }, 
        images (){
            return this.$store.getters['files/getFiles'] && this.$store.getters['files/getFiles'][this.img_bucket] || [];
        }
    },
    methods: {
        dataUrl(){
            return 'data:image/jpeg;base64,' + btoa(
                new Uint8Array(this.image_file)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
        },
        streamImage(curr_i){
            this.$store.dispatch('files/streamImage', {
                bucket: this.img_bucket,
                key: this.images[curr_i].file_name,
                callback_function: 'updateCurrentImageFile',
                loading_commit: 'setImageLoading'
            });
        }
    }
}
</script>
