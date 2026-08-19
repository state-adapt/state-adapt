<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{ currentMajor: string; screenMenu?: boolean }>();

const links = ref<{ text: string; link: string }[]>([]);
const isVersioned = ref(false);

const linkMajor = (link: { text: string; link: string }) =>
  link.link.match(/^\/v\/(\d+)\/$/)?.[1] ?? link.text.match(/^v(\d+)/)?.[1];

const activeLink = computed(() =>
  isVersioned.value
    ? links.value.find(link => linkMajor(link) === props.currentMajor)
    : links.value.find(link => link.link === '/'),
);

onMounted(async () => {
  isVersioned.value = /^\/(?:v\/\d+|__check__)\//.test(location.pathname);
  const response = await fetch('/versions.json');
  if (response.ok) links.value = await response.json();
});
</script>

<template>
  <div class="VersionLinks" :class="{ screenMenu }">
    <a
      v-for="link in links"
      :key="link.link"
      class="version-link"
      :class="{ active: link === activeLink }"
      :href="link.link"
      :aria-current="link === activeLink ? 'page' : undefined"
    >
      {{ link.text }}
    </a>
  </div>
</template>

<style scoped>
.VersionLinks:not(.screenMenu) {
  margin: 12px -12px 0;
  border-top: 1px solid var(--vp-c-divider);
  padding: 12px 12px 0;
}

.version-link {
  display: block;
  line-height: 32px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  transition: background-color 0.25s, color 0.25s;
}

.VersionLinks:not(.screenMenu) .version-link {
  border-radius: 6px;
  padding: 0 12px;
  font-weight: 500;
}

.VersionLinks.screenMenu .version-link {
  margin-left: 12px;
  font-weight: 400;
}

.version-link:hover,
.version-link.active {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-default-soft);
}
</style>
