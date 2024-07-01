import handlebars from "handlebars";
import fs from "fs";
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
/**
 * This is a utility function that reads an html file and replaces the placeholders with the values provided
 * @param path - The path to the html file
 * @param replacements - The values to replace the placeholders with
 * @returns The html file with the placeholders replaced
 * @throws Error if the file is not found
 * @throws Error if the file is not a valid html file
 * @throws Error if the replacements are not provided
 */
export const htmlToTemplate = (path: string, replacements: object) => {
  const htmlFile = fs.readFileSync(path, "utf8");
  if (!htmlFile) throw new Error("File not found");
  if (!replacements) throw new Error("Replacements not provided");
  const template = handlebars.compile(htmlFile);
  const html = template(replacements);
  return html;
};
