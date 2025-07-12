<script setup>
  import { sections } from './sections';
</script>

# Package: @state-adapt/rxjs

## Peer Dependencies

- [@state-adapt/core](/api/core/src/)
- [rxjs](https://www.npmjs.com/package/rxjs)

<template v-for="(section, index) in sections">
  
  ## {{ section.name }}
  
  <ul>
    <li v-for="item in section.items" :key="item.def.symbol">
      <a :href="item.def.link">{{ item.def.symbol }}</a>
    </li>
  </ul>
</template>
