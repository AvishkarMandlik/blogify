import swal from "sweetalert2";

import { currentUser } from "./currentUser";

export async function loginRequired() {
  if (!currentUser) {
    await swal.fire({
      title: "Login Required",
      text: "Please login to continue",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });
    window.location.href = "/login";
  }
}