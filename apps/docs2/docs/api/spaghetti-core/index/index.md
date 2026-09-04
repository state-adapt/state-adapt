<script setup>
  import { sections } from './sections';
</script>

# Package: @state-adapt/spaghetti-core

Shared TypeScript analysis for detecting commands, tracing their resource origins,
propagating observable effects, and calculating spaghetti scores.

<template v-for="(section, index) in sections">

  ## {{ section.name }}

  <ul>
    <li v-for="item in section.items" :key="item.def.symbol">
      <a :href="item.def.link">{{ item.def.symbol }}</a>
    </li>
  </ul>
</template>
