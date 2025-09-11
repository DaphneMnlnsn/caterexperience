import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosClient from "./axiosClient";

window.Pusher = Pusher;

await axiosClient.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });

window.Echo = new Echo({
  broadcaster: "pusher",
  key: process.env.REACT_APP_PUSHER_APP_KEY,
  cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: "http://localhost:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true,
  },
});

export default window.Echo;
