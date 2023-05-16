const mostFrequent = (arr) => {
  // get all different elements of array and create empty object
  const elements = new Set(arr);
  const elCount = {};

  // set unique elements of set as key for an object and assign value 0
  elements.forEach((el) => {
    elCount[el] = 0;
  });

  // increase value for each repetition of element
  arr.forEach((el) => {
    elCount[el] = elCount[el] + 1;
  });

  // get element that got repeated the most(first if more than one)
  const maxVal = [0, ""];
  for (const [key, value] of Object.entries(elCount)) {
    if (value > maxVal[0]) {
      maxVal[0] = value;
      maxVal[1] = key;
    }
  }
  return maxVal[1];
};

export default mostFrequent;
