<script setup>
  import { sections } from './sections';
</script>

# Package: @state-adapt/react

## Peer Dependencies

- [@state-adapt/core](/api/core/src/)
- [@state-adapt/rxjs](/api/rxjs/index/)

<template v-for="(section, index) in sections">
  
  ## {{ section.name }}
  
  <ul>
    <li v-for="item in section.items" :key="item.def.symbol">
      <a :href="item.def.link">{{ item.def.symbol }}</a>
    </li>
  </ul>
</template>
