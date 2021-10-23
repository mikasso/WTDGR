import BoardHub from "../SignalR/Hub";
import { GdfFormater } from "./Formaters/GdfFormater";

export { getFormater };

function getFormater(hub: BoardHub, fileExtension: string) {
  switch (fileExtension) {
    case "gdf":
      return new GdfFormater(hub);
    default:
      return new GdfFormater(hub);
  }
}
