const { addDays, format, isWithinInterval, endOfWeek } = require("date-fns");
const { fr } = require("date-fns/locale");

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getAnalytics = (data, config, timeframe) => {
  const { startOf, increment, format: formatStr, count } = config;
  const start = startOf(new Date());

  return Array.from({ length: count }, (_, i) => {
    const periodStart = increment(start, i);
    const periodEnd = increment(periodStart, 1);

    let formattedLabel;
    switch (timeframe) {
      case "day":
        formattedLabel = capitalizeFirstLetter(format(periodStart, "EEEE d MMMM", { locale: fr }));
        break;
      case "week":
        formattedLabel = capitalizeFirstLetter(format(periodStart, "EEEE d MMMM", { locale: fr }));
        break;
      case "month":
        formattedLabel = `Du ${format(periodStart, formatStr, { locale: fr }).toLowerCase()} au ${format(addDays(periodEnd, -1), formatStr, {
          locale: fr,
        }).toLowerCase()}`;
        break;
      case "year":
        formattedLabel = capitalizeFirstLetter(format(periodStart, "MMMM yyyy", { locale: fr }));
        break;
      default:
        formattedLabel = format(periodStart, formatStr, { locale: fr });
    }

    const value = Object.values(data).filter((event) => isWithinInterval(new Date(event.startTime), { start: periodStart, end: periodEnd })).length;

    return {
      label: format(periodStart, formatStr, { locale: fr }),
      formattedLabel,
      value,
    };
  });
};

module.exports = getAnalytics;
