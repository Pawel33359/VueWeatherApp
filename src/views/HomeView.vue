<template>
  <main class="container text-white">
    <div class="pt-4 mb-8 relative">
      <input
        type="text"
        v-model="searchQuery"
        @input="getSearchResults"
        @keydown.enter="goToFirstCity"
        placeholder="Search for a city"
        class="py-2 px-1 w-full bg-transparent border-b focus:border-weather-secondary focus:outline-none focus:shadow-[0px_1px_0_0_#004E71]"
      />
      <ul
        class="absolute bg-weather-secondary text-white w-full shadow-md py-2 px-1 top-[66px] border-white border-y-2 z-10"
        v-if="weatherSearchResults"
      >
        <p v-if="searchError">Sorry, something went wrong, please try again.</p>
        <p v-if="!searchError && weatherSearchResults.length === 0">
          No results match your query, try a different term.
        </p>
        <template v-else>
          <li
            v-for="(searchResult, index) in weatherSearchResults"
            :key="searchResult.id"
            class="py-2 cursor-pointer"
            @click="previewCity(searchResult)"
          >
            {{ searchResult.name }}, {{ searchResult.region }},
            {{ searchResult.country }}
            <hr />
          </li>
        </template>
      </ul>
    </div>
    <div class="flex flex-col">
      <Suspense>
        <CityList />
        <template #fallback>
          <CityCardSkeleton />
        </template>
      </Suspense>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import lodash from "lodash";

// COMPONENTS
import CityList from "../components/CityList.vue";
import CityCardSkeleton from "../components/CityCardSkeleton.vue";

const router = useRouter();

const previewCity = (searchResult) => {
  router.push({
    name: "cityView",
    params: {
      city: searchResult.name,
    },
    query: {
      country: searchResult.country,
      lat: searchResult.lat,
      lng: searchResult.lon,
      preview: true,
    },
  });
};

const searchQuery = ref("");
const queryTimeout = ref(null);
const weatherSearchResults = ref(null);
const searchError = ref(false);

const getSearchResults = () => {
  clearTimeout(queryTimeout.value);
  queryTimeout.value = setTimeout(async () => {
    if (searchQuery.value !== "") {
      try {
        searchError.value = false;
        const result = await axios.get(
          `https://api.weatherapi.com/v1/search.json?key=${
            import.meta.env.VITE_WEATHER_API_KEY
          }&q=${lodash.deburr(searchQuery.value)}`
        );
        weatherSearchResults.value = result.data;
      } catch {
        searchError.value = true;
      }
      return;
    }
    weatherSearchResults.value = null;
  }, 300);
};

const goToFirstCity = () => {
  if (weatherSearchResults.value.length === 0) return;
  else previewCity(weatherSearchResults.value[0]);
};
</script>
