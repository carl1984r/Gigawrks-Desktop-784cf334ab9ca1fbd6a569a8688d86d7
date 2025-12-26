import { IsLoggedIn } from "../../../wailsjs/go/main/App";
export async function IsLoggedInSafe() {
    if (typeof IsLoggedIn !== "function") {
        console.warn("⚠️ Wails runtime not loaded, returning false");
        return false;
    }
    return await IsLoggedIn();
}
