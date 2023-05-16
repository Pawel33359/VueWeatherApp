const getUnitAndSign = () => {
  const obj = {};
  obj.unit = localStorage.getItem("unit")
    ? localStorage.getItem("unit")
    : "metric";
  obj.sign = obj.unit === "metric" ? "C" : "F";

  return obj;
};

export default getUnitAndSign;
