<script setup>
  import { sections } from './sections';
</script>

# Package: @state-adapt/eslint-plugin-spaghetti

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

This ESLint plugin helps minimize spaghetti code. It warns when imperative code reaches too far across functions, scopes, files, or folders.

See the [`no-spaghetti` rule](/api/eslint-plugin-spaghetti/rules/no-spaghetti) for behavior and configuration.

<template v-for="(section, index) in sections">

  ## {{ section.name }}

  <ul>
    <li v-for="item in section.items" :key="item.def.symbol">
      <a :href="item.def.link">{{ item.def.symbol }}</a>
    </li>
  </ul>
</template>
