<template>
  <div class="flex flex-col min-h-screen font-Roboto bg-weather-primary">
    <SiteNavigation @updateUnit="updateUnit" />
    <RouterView v-slot="{ Component }" :key="unit">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import { ref } from "vue";

// COMPONENTS
import SiteNavigation from "./components/SiteNavigation.vue";

//COMPOSABLES
import getUnitAndSign from "./composables/getUnitAndSign";

const unit = ref(getUnitAndSign().unit);

const updateUnit = (newUnit) => {
  unit.value = newUnit;
};
</script>

<style>
.page-enter-active {
  transition: 600ms ease all;
}

.page-enter-from {
  opacity: 0;
}
</style>
