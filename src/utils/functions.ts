/**
 * This is a utility function that converts a number to a cool string
 * @param num - The number to convert
 * @returns A string representation of the number
 *
 */

export const numberToString = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + "K";
  if (num < 1000000000) return (num / 1000000).toFixed(1) + "M";
  return "0";
};
