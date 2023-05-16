<template>
  <div class="flex flex-col flex-1 items-center" v-if="!error">
    <!-- BANNER -->
    <div
      v-if="route.query.preview"
      class="text-white p-4 bg-weather-secondary w-full text-center"
    >
      <p>
        You are currently previewing this city, click the "+" icon to start
        tracking this city.
      </p>
    </div>
    <!-- CURRENT WEATHER OVERVIEW -->
    <div class="flex flex-col items-center text-white py-12">
      <h1 class="text-4xl mb-2">{{ route.params.city }}</h1>
      <p class="text-sm mb-12">
        {{
          new Date(weatherData.current.currentTime).toLocaleDateString(
            "en-us",
            {
              weekday: "short",
              day: "2-digit",
              month: "long",
            }
          )
        }}
        {{
          new Date(weatherData.current.currentTime).toLocaleTimeString(
            "en-us",
            {
              timeStyle: "short",
            }
          )
        }}
      </p>
      <p class="text-8xl mb-8">
        {{ Math.round(weatherData.current.main.temp) }}&deg;{{ sign }}
      </p>
      <p>
        Feels like
        {{ Math.round(weatherData.current.main.feels_like) }} &deg;{{ sign }}
      </p>
      <p class="capitalize">
        {{ weatherData.current.weather[0].description }}
      </p>
      <p>
        Air Quality:
        <span :class="[weatherData.air.quality.color]">
          {{ weatherData.air.quality.score }}
        </span>
      </p>
      <img
        class="w-[150px] h-auto"
        :src="`https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png`"
        alt=""
      />
    </div>

    <hr class="border-white border-opacity-10 border w-full" />

    <!-- HOURLY WEATHER -->
    <div class="max-w-screen-md w-full py-12">
      <div class="mx-8 text-white">
        <h2 class="mb-4">Hourly Weather</h2>
        <div class="flex gap-10 overflow-x-scroll scrollbar">
          <div
            v-for="hourData in weatherData.hourly"
            :key="hourData.dt"
            class="flex flex-col gap-4 items-center"
          >
            <p class="whitespace-nowrap text-md">
              {{
                new Date(hourData.currentTime).toLocaleTimeString("en-us", {
                  hour: "numeric",
                })
              }}
            </p>
            <img
              class="w-auto h-[50px] object-cover"
              :src="`https://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png`"
              alt=""
            />
            <p class="text-xl">
              {{ Math.round(hourData.main.temp) }}&deg;{{ sign }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <hr class="border-white border-opacity-10 border w-full" />

    <!-- DAILY WEATHER -->
    <div class="max-w-screen-md w-full py-12">
      <div class="mx-8 text-white">
        <h2 class="mb-4">Daily Forecast</h2>
        <div
          v-for="day in weatherData.daily"
          :key="day.name"
          class="flex items-center"
        >
          <p class="flex-1">
            {{ day.name }}
          </p>
          <img
            class="w-[50px] h-[50px] object-cover"
            :src="`https://openweathermap.org/img/wn/${day.icon}@2x.png`"
            alt=""
          />
          <div class="flex gap-2 flex-1 justify-end">
            <p>H: {{ Math.round(day.tempMax) }}&deg;{{ sign }}</p>
            <p>L: {{ Math.round(day.tempMin) }}&deg;{{ sign }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex items-center gap-2 py-12 text-white cursor-pointer duration-150 hover:text-red-500"
      @click="removeCurrentCity"
      v-if="!route.query.preview"
    >
      <i class="fa-solid fa-trash"></i>
      <p>Remove City</p>
    </div>
  </div>
  <div v-else class="text-center text-red-500 py-12 text-2xl">
    {{ error }}
  </div>
</template>

<script setup>
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
// COMPOSABLES
import mostFrequent from "../composables/mostFrequent.js";
import removeCity from "../composables/removeCity.js";
import getUnitAndSign from "../composables/getUnitAndSign";

const sign = ref(getUnitAndSign().sign);
const unit = ref(getUnitAndSign().unit);

const error = ref(null);

const route = useRoute();
const getWeatherData = async () => {
  try {
    const currentWeatherData = axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${
        route.query.lat
      }&lon=${route.query.lng}&appid=${
        import.meta.env.VITE_OPEN_WEATHER_MAP_API_KEY
      }&units=${unit.value}`
    );
    const forecastWeatherData = axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${
        route.query.lat
      }&lon=${route.query.lng}&appid=${
        import.meta.env.VITE_OPEN_WEATHER_MAP_API_KEY
      }&units=${unit.value}`
    );
    const airQualityWeatherData = axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${
        route.query.lat
      }&lon=${route.query.lng}&appid=${
        import.meta.env.VITE_OPEN_WEATHER_MAP_API_KEY
      }&units=${unit.value}`
    );

    // RESOLVE PROMISES
    const weatherCallData = await Promise.all([
      currentWeatherData,
      forecastWeatherData,
      airQualityWeatherData,
    ]);

    // set current time for current forecast
    const localOffset = new Date().getTimezoneOffset() * 60000;
    const utc = weatherCallData[0].data.dt * 1000 + localOffset;
    weatherCallData[0].data.currentTime =
      utc + 1000 * weatherCallData[0].data.timezone;
    // set current time for hourly forecast
    weatherCallData[1].data.list.forEach((hour) => {
      const utc = hour.dt * 1000 + localOffset;
      hour.currentTime = utc + 1000 * weatherCallData[1].data.city.timezone;
    });

    ///////////////////////////////////////////////////////////////////////////////
    // SET CURRENT WEATHER
    const weatherData = {};

    weatherData.current = weatherCallData[0].data;

    ///////////////////////////////////////////////////////////////////////////////
    // SET AIR QUALITY

    const aqi = weatherCallData[2].data.list[0].main.aqi;
    let AirQuality = {};
    switch (aqi) {
      case 1:
        AirQuality.score = "Good";
        AirQuality.color = "text-green-600";
        break;
      case 2:
        AirQuality.score = "Fair";
        AirQuality.color = "text-green-300";
        break;
      case 3:
        AirQuality.score = "Moderate";
        AirQuality.color = "text-yellow-200";
        break;
      case 4:
        AirQuality.score = "Poor";
        AirQuality.color = "text-orange-400";
        break;
      case 5:
        AirQuality.score = "Very Poor";
        AirQuality.color = "text-red-500";
        break;
    }

    weatherData.air = {
      quality: AirQuality,
      components: weatherCallData[2].data.list[0].components,
    };

    ///////////////////////////////////////////////////////////////////////////////
    // SET 3-HOUR WEATHER
    const hourlyWeatherData = [];
    for (let i = 0; i < 8; i++) {
      hourlyWeatherData.push(weatherCallData[1].data.list[i]);
    }
    weatherData.hourly = hourlyWeatherData;

    ///////////////////////////////////////////////////////////////////////////////
    // SET DAILY WEATHER
    const dailyWeatherData = [];

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]; // array holding day names for getDay() function

    let currentDay = dayNames[new Date(weatherData.current.currentTime)]; // variable holding the name of current day
    let sampleAmount = 0; // variable for making sure there are at lest two samples
    let tempMax = weatherData.current.main.temp; // variable for setting max temperature
    let tempMin = weatherData.current.main.temp; // variable for setting min temperature
    const weatherIcons = []; // for checking what weather most likely will be on chosen day

    // iterate through 5 day hourly forecast data
    weatherCallData[1].data.list.forEach((hour) => {
      // increase sampleCount and get forecast day name
      sampleAmount += 1;
      const day = dayNames[new Date(hour.currentTime).getDay()];

      // Check if day changed and there is more than one sample taken
      if (day !== currentDay && sampleAmount > 1) {
        // get day weather(from most frequent icon)
        const icon = mostFrequent(weatherIcons);

        // push forecast data to array
        dailyWeatherData.push({
          name: currentDay,
          tempMax,
          tempMin,
          icon,
        });

        // clear data for another day
        sampleAmount = 0;
        tempMax = hour.main.temp;
        tempMin = hour.main.temp;
        currentDay = day;
        weatherIcons.length = 0;
      }
      // Check if day changed and there is one or less sample taken
      else if (day !== currentDay && sampleAmount <= 1) {
        // clear data for another day
        sampleAmount = 0;
        tempMax = hour.main.temp;
        tempMin = hour.main.temp;
        currentDay = day;
        weatherIcons.length = 0;
      } else {
        // set new min and max temperatures
        if (tempMax < hour.main.temp) tempMax = hour.main.temp;
        if (tempMin > hour.main.temp) tempMin = hour.main.temp;
        // push weather icon to array for checking weather
        weatherIcons.push(hour.weather[0].icon);
      }
    });

    weatherData.daily = dailyWeatherData;

    return weatherData;
  } catch (err) {
    error.value = "Oops! Something went wrong!";
  }
};
const weatherData = await getWeatherData();

const router = useRouter();
const removeCurrentCity = () => {
  removeCity(route.query.id);
  router.push({
    name: "home",
  });
};
</script>
