import swal from "sweetalert2";
import { currentUser } from "./currentUser";

export const loginRequired = async () => {
  if (!currentUser) {
    const { isConfirmed } = await swal.fire({
      title: "Login Required",
      text: "Please login to continue",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (isConfirmed) {
      window.location.href = "/login";
    }
  }
}