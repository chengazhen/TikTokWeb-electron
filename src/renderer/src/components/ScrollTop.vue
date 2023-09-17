<template>
  <div v-if="y > 0" class="fixed bottom-10 right-10">
    <img class="w-12" src="@renderer/assets/svg/scroll-top.svg" alt="" @click="scrollToTop" />
  </div>
</template>

<script setup>
import { useWindowScroll } from '@vueuse/core'
const { y } = useWindowScroll()
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<style lang="scss" scoped></style>
