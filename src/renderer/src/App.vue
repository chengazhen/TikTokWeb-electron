<script setup>
import { NMessageProvider } from 'naive-ui'
// import Versions from './components/Versions.vue'
</script>

<template>
  <n-message-provider>
    <RouterView />
  </n-message-provider>
</template>

<style lang="scss">
html {
  height: 100%;
}
</style>
