const { addDays, format, isWithinInterval, startOfToday, isSameDay } = require("date-fns");
const { fr } = require("date-fns/locale");

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getAnalytics = (data, config, timeframe) => {
  const { startOf, increment, format: formatStr, count } = config;
  const start = startOf(new Date());
  const today = startOfToday();

  const isCurrentPeriod = (periodStart, periodEnd, timeframe) => {
    switch (timeframe) {
      case "day":
        return isSameDay(periodStart, today);
      case "week":
      case "month":
      case "year":
        return isWithinInterval(today, {
          start: periodStart,
          end: addDays(periodEnd, -1), // Subtract one day since periodEnd is start of next period
        });
      default:
        return false;
    }
  };

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
      frontColor: isCurrentPeriod(periodStart, periodEnd, timeframe) ? "#4E2A84" : "#000",
    };
  });
};

module.exports = getAnalytics;
