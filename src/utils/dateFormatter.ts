export const dateFormatter = (date: Date) => {
  try {
    if (date) {
      const dateObj = new Date(date);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Nairobi",
      };
      const formattedDate = new Intl.DateTimeFormat("en-KE", options).format( dateObj );
      return formattedDate;
    }
  } catch (error) {
    console.log(error);
  }
};