<template>
<v-container grid-list-md>
  <div>
    <!-- ########## header start ########## -->
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>lock</v-icon>
        Roles &#38; Permissions
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
      <!-- ########## header end ########## -->
      <v-dialog v-model="dialog" max-width="50%">
        <template v-slot:activator="{ on }">
          <!-- <v-btn class="mb-2" v-on="on">New Role</v-btn> -->
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <!-- ########## edit item start ########## -->
              <v-layout wrap>
                <v-flex xs12><v-text-field v-model="editedItem.name" label="Role Name"></v-text-field></v-flex>
                <p>Permissions</p>
                <v-expansion-panel>
                  <v-expansion-panel-content>
                    <template v-slot:actions>
                      <v-icon color="primary">$vuetify.icons.expand</v-icon>
                    </template>
                    <template v-slot:header>
                      <div>States</div>
                    </template>
                    <div v-show="!inner">
                      <v-data-table
                      :footer-props="{
                          'items-per-page-options': [25, 50, 100]
                        }"
                        :items-per-page="25"
                        :headers="permission_headers" :items="permission_actions" 
                        item-key="name" hide-actions light>
                        <template v-slot:headers="props">
                          <tr><th v-for="header in props.headers" :key="header.text">{{ header.text }}</th></tr>
                        </template>
                        <template v-slot:items="props">
                          <tr>
                            <td><b>{{ props.item.name }}</b></td>
                            <td>
                              <v-checkbox v-model="props.item.value" primary hide-details
                               :label="props.item.value ? 'Enabled' : 'Disabled'">
                              </v-checkbox>
                            </td>
                            <td><v-btn color="accent" small @click="inner = true">Edit</v-btn></td>
                          </tr>
                        </template>
                      </v-data-table>
                    </div>
                    <div v-show="inner">
                      <v-data-table
                      :footer-props="{
                          'items-per-page-options': [25, 50, 100]
                        }"
                        :items-per-page="25"
                        :headers="default_permission_headers" :items="default_permission_values" 
                        item-key="name" hide-actions disable-initial-sort light>
                        <template v-slot:headers="props">
                          <tr>
                            <th v-for="header in props.headers" :key="header.text">
                              <div v-show="header.text != 'Back'">{{ header.text }}</div>
                              <div v-show="header.text == 'Back'">
                                <v-btn color="accent" small @click="inner = false"><v-icon>arrow_left</v-icon>Back</v-btn>
                              </div>
                            </th>
                          </tr>
                        </template>
                        <template v-slot:items="props">
                          <tr>
                            <td>
                              <div v-show="props.item.added">{{ props.item.name }}</div>
                              <div v-show="!props.item.added"><v-text-field v-model="props.item.name"></v-text-field></div>
                            </td>
                            <td>
                              <v-checkbox v-model="props.item.value" primary hide-details 
                                :label="props.item.value ? 'Enabled' : 'Disabled'">
                              </v-checkbox>
                            </td>
                            <td>
                              <v-btn color="accent" small fab v-show="props.item.added"><v-icon >remove</v-icon></v-btn>  
                              <v-btn color="accent" small fab v-show="!props.item.added"><v-icon >add</v-icon></v-btn>
                            </td>
                          </tr>
                        </template>
                      </v-data-table>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-layout>
              <!-- ########## edit item end ########## -->
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="close">Cancel</v-btn>
            <v-btn text @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <!-- ########## table start ########## -->
    <v-data-table
    :footer-props="{
      'items-per-page-options': [25, 50, 100]
    }"
    :items-per-page="25"
    :headers="headers" :items="roles" :search="search" class="elevation-1">
      <template v-slot:items="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.name }}</td>
        <td class="justify-center layout px-0">
          <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
          <v-icon small @click="deleteItem(props.item)">delete</v-icon>
        </td>
      </template>
      <template v-slot:no-data>
          <v-alert :value="true" color="info" icon="warning">
            Sorry, nothing to display here :(
          </v-alert>
      </template>
      <template v-slot:no-results>
          <v-alert :value="true" color="info" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
      </template>
    </v-data-table>
    <!-- ########## table end ########## -->
  </div>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    headers: [
      { text: 'Id', value: 'id', width: '15%'},
      { text: 'Name', value: 'name', width: '70%' },
      { text: 'Actions', width: '15%', value: 0 }
    ],
    permission_headers: [
      { text: 'Action', value: 'id', width: '33%'},
      { text: 'Default Permission', value: 'name', width: '33%' },
      { text: 'Values', width: '33%', value: 0 }
    ],
    permission_actions: [
      { name: 'View', value: true },
      { name: 'Create', value: true },
      { name: 'Update', value: true },
      { name: 'Delete', value: true },
    ],
    default_permission_headers: [
      { text: 'Value', value: 'name', width: '40%'},
      { text: 'Permission', value: 'value', width: '40%' },
      { text: 'Back', width: '20%', value: 0 }
    ],
    default_permission_values: [
      { name: 'admin', value: false, added: true},
      { name: '', value: false, added: false }
    ],
    inner: false,
    search: '',
    editedIndex: -1,
    editedItem: {},
    defaultItem: {}
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Role' : 'Edit Role'
    },
    roles (){
      return this.$store.getters['users/getRoles'] || [];
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    initialize () {
      this.$store.dispatch('users/fetchRoles')
    },

    editItem (item) {
      this.editedIndex = this.roles.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      confirm('Are you sure you want to delete role "' + item.fullName + '"?') && 
        this.$store.dispatch('users/deleteRole', item);
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      if (this.editedIndex > -1) {
        this.$store.dispatch('users/updateRole', this.editedItem);
      } else {
        // dispatch create user 
        // this.roles.push(this.editedItem)
      }
      this.close()
    }
  }
}
</script>