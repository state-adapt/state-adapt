<script setup>
  import { sections } from './sections';
</script>

# Package: @state-adapt/core

## Peer Dependencies

None

<template v-for="(section, index) in sections">
  
  ## {{ section.name }}
  
  <ul>
    <li v-for="item in section.items" :key="item.def.symbol">
      <a :href="item.def.link">{{ item.def.symbol }}</a>
    </li>
  </ul>
</template>

## Core Adapters

[Core Adapters](/api/core/adapters/)
