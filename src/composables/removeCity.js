const removeCity = (cityID) => {
  const cities = JSON.parse(localStorage.getItem("savedCities"));
  const updatedCities = cities.filter((city) => city.id !== cityID);

  localStorage.setItem("savedCities", JSON.stringify(updatedCities));
  return updatedCities;
};

export default removeCity;
