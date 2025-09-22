import Echo from "laravel-echo";
import Ably from "ably";
import axiosClient from "./axiosClient";

await axiosClient.get(`${process.env.REACT_APP_BASE_URL}/sanctum/csrf-cookie`, {
  withCredentials: true,
});

const ablyClient = new Ably.Realtime({
  key: process.env.REACT_APP_ABLY_KEY,
  autoConnect: true,
});

window.Echo = new Echo({
  broadcaster: "ably",
  client: ablyClient,
});

export default window.Echo;
