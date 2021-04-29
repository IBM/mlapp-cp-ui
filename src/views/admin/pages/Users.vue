<template>
  <div>
    <v-data-table
    :footer-props="{
      'items-per-page-options': [25, 50, 100]
    }"
    :items-per-page="25"
    :loading="isLoading" loading-text="Loading... Please wait"
    :headers="headers"
    :items="users"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon>person</v-icon>
          Users
        </v-toolbar-title>
        <div class="flex-grow-1"></div>
        <v-dialog v-model="dialog" max-width="50%">
          <template v-slot:activator="{ on }">
            <v-btn v-show="allowCreateUser" class="mb-2" v-on="on">Create New User</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <!-- <v-flex xs6><v-text-field v-model="editedItem.iui" disabled label="IUI"></v-text-field></v-flex> -->
                  <v-flex xs12><v-text-field :rules="[rules.required, rules.email]"  v-model="editedItem.email" label="Email" v-show="editedIndex == -1"></v-text-field></v-flex>
                  <v-flex xs12><v-text-field :value="userEmail(editedItem)" label="Email" disabled v-show="editedIndex > -1"></v-text-field></v-flex>
                  <v-flex xs12><v-text-field :rules="[rules.required]" type="password" v-model="editedItem.password" v-show="editedIndex == -1" label="Password"></v-text-field></v-flex>
                  <v-flex xs12>
                    <v-select 
                      v-model="editedItem.status"
                      :items="statusesList" 
                      :rules="[rules.required]"
                      item-text="name"
                      item-value="id"
                      label="Status" required>
                    </v-select>
                  </v-flex>
                  <v-flex xs12>
                    <v-select 
                      v-model="editedItem.role"
                      :items="rolesList" 
                      :rules="[rules.required]"
                      item-text="name"
                      item-value="id"
                      label="Role" required>
                    </v-select>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="closeNewUser">Cancel</v-btn>
              <v-btn text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.email="{ item }">
      <span style="padding-bottom:3px;">{{ item.email }}</span>
    </template>
    <template v-slot:item.status="{ item }">
      <span style="padding-bottom:3px;">{{ statuses[item.status] }}</span>
    </template>
    <template v-slot:item.role="{ item }">
      <span style="padding-bottom:3px;">{{ item.role }}</span>
    </template>    
    <template v-slot:item.action="{ item }">
      <v-icon v-show="allowUpdateUser" small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
      <v-icon v-show="allowDeleteUser" small @click="deleteItem(item)">delete</v-icon>
      <span v-show="!allowUpdateUser || !allowDeleteUser"> - </span>
    </template>
    <template v-slot:no-data>
      No data is available
    </template>
    <template v-slot:no-results>
        Your search for "{{ search }}" found no results
    </template>
  </v-data-table>
  </div>  
</template>

<style scoped>
</style>

<script>

export default {
  data: () => ({
    dialog: false,
    headers: [
      { text: 'Email', value: 'email', width: '30%' },
      { text: 'Status', value: 'status', width: '30%' },
      { text: 'Role', value: 'role', width: '30%' },
      { text: 'Actions', value: 'action' , width: '10%'}
    ],
    statuses: {
      '1': 'Active',
      // '0': 'Disabled',
      // '-1': 'Pending'
    },
    roles: {
      'user': 'user',      
      'admin': 'admin',
    },
    
    search: '',
    editedIndex: -1,
    editedItem: {},
    defaultItem: {status: "1", role: "user"},
    rules: {
      required: value => !!value || 'This field is required.',
      // passwordSecurity: value => value.length > 12 || 'Password must be 12 characters or more.',
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || 'Invalid e-mail.'
      },
    },
  }),
  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New User' : 'Edit User'
    },
    users (){
      return this.$store.getters['users/getUsers'] || [];
    },
    statusesList (state){
      return Object.keys(state.statuses).map((key) => { return {'id': key, 'name': state.statuses[key]} });
    },
    rolesList (state){
      return Object.keys(state.roles).map((key) => { return {'id': key, 'name': state.roles[key]} });
    },
    isLoading (){
      return this.$store.getters['users/isLoading'];
    },
    allowDeleteUser (){
      return this.$store.getters['permissions/allowDeleteUser'];
    },
    allowCreateUser (){
      return this.$store.getters['permissions/allowCreateUser'];
    },
    allowUpdateUser (){
      return this.$store.getters['permissions/allowUpdateUser'];
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
      this.$store.dispatch('users/fetchUsers')
      this.$store.dispatch('permissions/setPermissions')
    },

    userEmail (item) {
        return item.emails && item.emails && item.emails[0].value || item.email
    },

    editItem (item) {
      if (!this.allowUpdateUser) return;
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      var userEmail = this.userEmail(item);
      confirm('Are you sure you want to delete user "' + userEmail + '"?') && 
        this.$store.dispatch('users/deleteUser', item);
    },

    closeNewUser() {
      this.dialog = false
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
        //update
        this.$store.dispatch('users/updateUser', this.editedItem);
      } 
      else {
        //create        
        if (this.editedItem.email && this.editedItem.status) {
          this.$store.dispatch('users/createUser', this.editedItem);
          this.close();
        }
      }
      this.close()
    }
  }
}
</script>