<script setup lang="ts">
import { useRoute } from 'vitepress';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

interface VersionLink {
  text: string;
  link: string;
  href: string;
}

let versionLinksRequest: Promise<VersionLink[]> | undefined;
const pageExistsRequests = new Map<string, Promise<boolean>>();

const props = defineProps<{ currentMajor: string; screenMenu?: boolean }>();

const route = useRoute();
const root = ref<HTMLElement>();
const links = ref<VersionLink[]>([]);
const isVersioned = ref(false);
let menu: Element | null = null;
let resolvedPath = '';

const linkMajor = (link: VersionLink) =>
  link.link.match(/^\/v\/(\d+)\/$/)?.[1] ?? link.text.match(/^v(\d+)/)?.[1];

const activeLink = computed(() =>
  isVersioned.value
    ? links.value.find(link => linkMajor(link) === props.currentMajor)
    : links.value.find(link => link.link === '/'),
);

const getVersionLinks = () => {
  versionLinksRequest ??= fetch('/versions.json').then(async response => {
    if (!response.ok) return [];
    const published = (await response.json()) as Omit<VersionLink, 'href'>[];
    return published.map(link => ({ ...link, href: link.link }));
  });
  return versionLinksRequest;
};

const pageExists = (path: string) => {
  let request = pageExistsRequests.get(path);
  if (!request) {
    request = fetch(path, { method: 'HEAD' })
      .then(response => response.ok)
      .catch(() => false);
    pageExistsRequests.set(path, request);
  }
  return request;
};

const getRelativePath = (pathname: string) =>
  pathname.replace(/^\/(?:v\/\d+|__check__)(?:\/|$)/, '/').replace(/^\//, '');

async function resolveVersionPages() {
  const pathname = location.pathname;
  if (!links.value.length || resolvedPath === pathname) return;

  resolvedPath = pathname;
  const relativePath = getRelativePath(pathname);
  const currentLink = activeLink.value?.link;
  const suffix = location.search + location.hash;
  const resolved = await Promise.all(
    links.value.map(async link => {
      if (!relativePath) return link;

      const candidate = link.link + relativePath;
      const exists = link.link === currentLink || (await pageExists(candidate));
      return { ...link, href: (exists ? candidate : link.link) + suffix };
    }),
  );

  if (location.pathname === pathname) links.value = resolved;
  else resolvedPath = '';
}

const resolveOnInteraction = () => void resolveVersionPages();

onMounted(async () => {
  isVersioned.value = /^\/(?:v\/\d+|__check__)\//.test(location.pathname);
  menu = root.value?.closest('.VPFlyout, .VPNavScreenMenuGroup') ?? null;
  menu?.addEventListener('mouseenter', resolveOnInteraction);
  menu?.addEventListener('focusin', resolveOnInteraction);
  menu?.addEventListener('click', resolveOnInteraction);

  links.value = await getVersionLinks();
  const menuButton = menu?.querySelector(':scope > button[aria-expanded="true"]');
  if (menuButton || menu?.matches(':hover')) await resolveVersionPages();
});

onUnmounted(() => {
  menu?.removeEventListener('mouseenter', resolveOnInteraction);
  menu?.removeEventListener('focusin', resolveOnInteraction);
  menu?.removeEventListener('click', resolveOnInteraction);
});

watch(
  () => route.path,
  () => {
    resolvedPath = '';
    links.value = links.value.map(link => ({ ...link, href: link.link }));
  },
);
</script>

<template>
  <div ref="root" class="VersionLinks" :class="{ screenMenu }">
    <a
      v-for="link in links"
      :key="link.link"
      class="version-link"
      :class="{ active: link === activeLink }"
      :href="link.href"
      target="_self"
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
