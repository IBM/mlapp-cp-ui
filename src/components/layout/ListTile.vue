<template>
<v-list-item @click="$router.push(url).catch(err => {})">
    <v-list-item-action v-if="icon != null">
        <v-icon>{{icon}}</v-icon>
    </v-list-item-action>
    <v-list-item-content>
        <v-list-item-title>{{title}}</v-list-item-title>
    </v-list-item-content>
</v-list-item>
</template>

<script>
export default {
  name: 'ListTile',
  data: () => ({

  }),
  props: ['icon', 'title', 'url'],
}
</script>