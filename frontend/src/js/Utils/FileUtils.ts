import { GdfFormater } from "./Formaters/GdfFormater";

export { getFormater };

function getFormater(fileExtension: string) {
  switch (fileExtension) {
    case "gdf":
      return new GdfFormater();
    default:
      return new GdfFormater();
  }
}
