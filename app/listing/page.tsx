import { redirect } from "next/navigation";

export default function ListingPage() {
  // Redirect to restaurant signup flow
  redirect("/signup/restaurant");
}
