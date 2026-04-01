<script setup>
import { onMounted, onUnmounted, ref } from 'react';
import { createRoot } from 'react-dom/client';
import { Adminix } from 'adminix';
import 'adminix/style.css';

const container = ref(null);
let root = null;

const props = defineProps({
  resources: { type: Array, default: () => [] },
  title: { type: String, default: 'Adminix Panel' }
});

onMounted(() => {
  if (container.value) {
    root = createRoot(container.value);
    root.render(
      <Adminix 
        resources={props.resources} 
        title={props.title} 
        defaultDarkMode={true} 
      />
    );
  }
});

onUnmounted(() => {
  if (root) {
    root.unmount();
  }
});
</script>

<template>
  <div ref="container" class="h-screen w-full"></div>
</template>
