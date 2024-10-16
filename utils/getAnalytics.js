const { addDays, format, isWithinInterval, endOfWeek } = require("date-fns");
const { fr } = require("date-fns/locale");

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getAnalytics = (data, config, timeframe) => {
  const { startOf, increment, isSame, format: formatStr, count } = config;
  const start = startOf(new Date());

  return Array.from({ length: count }, (_, i) => {
    const periodStart = increment(start, i);
    const periodEnd = increment(periodStart, 1);

    let formattedPeriod;
    switch (timeframe) {
      case "day":
        formattedPeriod = capitalizeFirstLetter(format(periodStart, "EEEE d MMMM", { locale: fr }));
        break;
      case "week":
        formattedPeriod = capitalizeFirstLetter(format(periodStart, "EEEE d MMMM", { locale: fr }));
        break;
      case "month":
        const weekEnd = endOfWeek(periodStart, { weekStartsOn: 1 });
        formattedPeriod = `Du ${format(periodStart, "dd", { locale: fr })} au ${format(weekEnd, "dd MMMM", { locale: fr })}`;
        break;
      case "year":
        formattedPeriod = capitalizeFirstLetter(format(periodStart, "MMMM yyyy", { locale: fr }));
        break;
      default:
        formattedPeriod = format(periodStart, formatStr, { locale: fr });
    }

    const events = Object.values(data).filter((event) => isWithinInterval(new Date(event.startTime), { start: periodStart, end: periodEnd })).length;

    // return {
    //   period:
    //     timeframe === "month"
    //       ? `${format(periodStart, formatStr, { locale: fr }).toLowerCase()} - ${format(addDays(periodEnd, -1), formatStr, {
    //           locale: fr,
    //         }).toLowerCase()}`
    //       : format(periodStart, formatStr, { locale: fr }).toLowerCase(),
    //   events,
    // };

    return {
      period: format(periodStart, formatStr, { locale: fr }),
      formattedPeriod,
      events,
    };
  });
};

module.exports = getAnalytics;
