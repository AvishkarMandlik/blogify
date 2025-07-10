import swal from "sweetalert2";
import { getUserProfile } from "./getUserProfile";

export const loginRequired = async () => {
  const user  = await getUserProfile();
  if (!user ) {
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
  return user;
}