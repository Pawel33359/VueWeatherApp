<template>
  <div class="text-center flex justify-center pb-5">
    <button class="cursor-pointer w-1/5 border-b-2" @click="changeSort">
      Sort by:
      {{ sortTypes[currentSortType] }}
    </button>
  </div>
  <div v-for="city in savedCities" :key="city.id" v-if="!error">
    <CityCard :city="city" v-if="!city.deleted" @deleteCity="deleteCity" />
  </div>
  <div v-else class="text-center text-red-500 py-12 text-2xl">
    {{ error }}
  </div>

  <p v-if="savedCities.length === 0">
    No locations added. To start tracking a location, search in the field above.
  </p>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";
import lodash from "lodash";

// COMPONENTS
import CityCard from "./CityCard.vue";
import getUnitAndSign from "../composables/getUnitAndSign";

const error = ref(null);
const savedCities = ref([]);
const getCities = async () => {
  try {
    if (localStorage.getItem("savedCities")) {
      savedCities.value = JSON.parse(localStorage.getItem("savedCities"));
    }

    const requests = [];
    savedCities.value.forEach((city, index) => {
      // For deleting from DOM and sorting
      city.deleted = false;
      city.order = index;

      requests.push(
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${
            city.coords.lat
          }&lon=${city.coords.lng}&appid=${
            import.meta.env.VITE_OPEN_WEATHER_MAP_API_KEY
          }&units=${getUnitAndSign().unit}`
        )
      );
    });

    const weatherData = await Promise.all(requests);

    weatherData.forEach((value, index) => {
      savedCities.value[index].weather = value.data;
    });
  } catch (err) {
    error.value = "Oops! Something went wrong!";
  }
};
await getCities();

const deleteCity = (cityID) => {
  savedCities.value[
    savedCities.value.findIndex((city) => city.id === cityID)
  ].deleted = true;
};
// SORTING
const sortTypes = ref(["first added", "last added", "from A-Z", "from Z-A"]);
const currentSortType = ref(0);

const changeSort = () => {
  currentSortType.value =
    currentSortType.value >= sortTypes.value.length - 1
      ? 0
      : currentSortType.value + 1;

  let sortFn;
  switch (currentSortType.value) {
    case 0:
      sortFn = sortByAdded;
      break;
    case 1:
      sortFn = sortByReverseAdded;
      break;
    case 2:
      sortFn = sortAlphabetically;
      break;
    case 3:
      sortFn = sortReverseAlphabetically;
      break;
  }

  savedCities.value = savedCities.value.sort(sortFn);
};

const sortByAdded = (a, b) => a.order - b.order;
const sortByReverseAdded = (a, b) => b.order - a.order;
const sortAlphabetically = (a, b) => {
  const nameA = lodash.deburr(a.city.toLowerCase());
  const nameB = lodash.deburr(b.city.toLowerCase());
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};
const sortReverseAlphabetically = (a, b) => {
  const nameA = lodash.deburr(a.city.toLowerCase());
  const nameB = lodash.deburr(b.city.toLowerCase());
  if (nameA < nameB) {
    return 1;
  }
  if (nameA > nameB) {
    return -1;
  }
  return 0;
};
</script>
