export const shortenAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const fancyTimeFormat = (duration: number, short?: boolean) => {
  // Hours, minutes and seconds
  var days = ~~(duration / 86400);
  var hrs = ~~((duration % 86400) / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (days > 0) {
    ret += "" + days + "d " + (hrs < 10 ? "0" : "");
  }

  if (hrs > 0) {
    ret += "" + hrs + "hr " + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + "m ";
  if (!short) {
    ret += "" + (secs < 10 ? "0" : "") + secs + "s ";
  }
  return ret;
};
