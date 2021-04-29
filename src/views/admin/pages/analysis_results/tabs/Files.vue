<template>
    <div style="height: 100%;">
        <div class="progress-circular-container">
            <v-progress-circular v-if="isLoading" :size="70" :width="7" indeterminate></v-progress-circular>
        </div>
        <v-card style="height: 100%;">
            <v-list two-line>
                <template v-for="(files_list, bucket_name) in files">
                    <!-- <v-subheader v-bind:key="bucket_name">{{bucket_name}}</v-subheader> -->
                    <v-list-item v-for="(file, index) in files_list" :key="(bucket_name + '_' + index)" @click="downloadFile(file.file_name, bucket_name)">
                        <v-list-item-avatar>
                            <v-icon class="blue lighten-1 white--text">{{fileIcon(file.file_name)}}</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title>{{file.file_name}} <span style="font-size: 12px; color:grey;">({{bucket_name}})</span></v-list-item-title>
                            <v-list-item-subtitle>
                                {{file.last_modified}}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="white lighten-1">mdi-download</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </template>
            </v-list>
        </v-card> 
    </div>      
</template>


<script>

export default {
    data: () => ({
        
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
    components: {},
    computed: {    
        files (){
            return this.$store.getters['files/getFiles'] || [];
        },
        isLoading (){
            return this.$store.getters['files/isLoading'];
        } 
    },
    methods: {
        downloadFile(file_name, bucket_name){
            this.$store.dispatch('files/downloadFile', {
                bucket: bucket_name,
                key: file_name
            });
        },
        fileIcon(file_name){
            var split = file_name.split('.');
            var file_type = split[split.length - 1];
            if(file_type == 'csv') return 'mdi-file-excel-outline';
            if(file_type == 'json') return 'mdi-json';
            if(file_type == 'png') return 'mdi-image';
            if(file_type == 'txt') return 'mdi-file-document-box';
            if(split.length > 1 && split[2] == 'zip') return 'mdi-folder-zip';
            return 'mdi-file';
        }
    }
}
</script>