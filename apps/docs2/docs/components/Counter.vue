<script setup lang="ts">
import { ref, defineProps } from 'vue';

// prop `broken`:

// - if true, the component will not be reactive
// - if false, the component will be reactive
const props = defineProps<{
  broken?: boolean;
}>();

const count = ref(2);

function increment() {
  count.value++;
}
</script>

<template>
  <div style="display: flex; justify-content: space-around">
    <p style="margin: 8px">
      Count:
      <span id="count">{{ count }}</span>
    </p>

    <p>Double: {{ props.broken ? 4 : count * 2 }}</p>
  </div>

  <button @click="increment">Increment</button>
</template>

<style scoped>
button {
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
  border-color: var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
}
</style>
