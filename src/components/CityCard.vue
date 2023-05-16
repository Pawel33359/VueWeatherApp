<template>
  <div class="pb-4">
    <div class="relative cursor-pointer transition-all hover:shadow-xl">
      <div
        class="flex py-6 px-6 bg-weather-secondary rounded-md shadow-md"
        @click="goToCityView(city)"
      >
        <div class="flex flex-col flex-1">
          <h2 class="text-3xl">{{ city.city }}</h2>
          <h3>{{ city.country }}</h3>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-3xl self-end">
            {{ Math.round(city.weather.main.temp) }}&deg;{{ sign }}
          </p>
          <div class="flex gap-2">
            <span class="text-xs">
              H:
              {{ Math.round(city.weather.main.temp_max) }}&deg;{{ sign }}
            </span>
            <span class="text-xs">
              L:
              {{ Math.round(city.weather.main.temp_min) }}&deg;{{ sign }}
            </span>
          </div>
        </div>
      </div>
      <div
        class="bg-red-700 h-full absolute top-0 right-0 w-4 flex items-center justify-center rounded-r-lg hover:w-12 hover:-right-8 transition-all"
        @click="removeChosenCity"
      >
        <i class="fa-solid fa-trash none"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";

// COMPOSABLES
import removeCity from "../composables/removeCity.js";
import getUnitAndSign from "../composables/getUnitAndSign";

const sign = ref(getUnitAndSign().sign);

const props = defineProps({
  city: {
    type: Object,
    default: () => {},
  },
});

const router = useRouter();
const goToCityView = () => {
  router.push({
    name: "cityView",
    params: { city: props.city.city },
    query: {
      country: props.city.country,
      lat: props.city.coords.lat,
      lng: props.city.coords.lng,
      id: props.city.id,
    },
  });
};

const emits = defineEmits(["deleteCity"]);

const removeChosenCity = () => {
  removeCity(props.city.id);
  emits("deleteCity", props.city.id);
};
</script>
