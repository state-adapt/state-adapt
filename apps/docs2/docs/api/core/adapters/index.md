<script setup>
  import { sections } from './sections';
</script>

# Package: @state-adapt/core/adapters

## Peer Dependencies

- [@state-adapt/core](/api/core/src/)

<template v-for="(section, index) in sections">

  ## {{ section.name }}

  <ul>
    <li v-for="item in section.items" :key="item.def.symbol">
      <a :href="item.def.link">{{ item.def.symbol }}</a>
    </li>
  </ul>
</template>

See [the version 3 adapter docs](https://state-adapt.github.io/versions/3-0-0/adapters/core) for older APIs.
