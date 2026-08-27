<script setup>
import packages from './packages.json';
</script>

# API Reference

## Packages

<template v-for="pkg in packages" :key="pkg.name">

<h3><a :href="pkg.link">{{ pkg.name }}</a></h3>

{{ pkg.description }}

</template>
