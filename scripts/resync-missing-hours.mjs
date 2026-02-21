/**
 * Re-sync opening hours for restaurants missing them in Supabase.
 * Fetches from Google Places API (New) and updates mall_restaurants.opening_hours.
 */

const SUPABASE_URL = "https://hgdedyrjkywaboalisaw.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGVkeXJqa3l3YWJvYWxpc2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQwMzMyNiwiZXhwIjoyMDgxOTc5MzI2fQ.UHEFZBuZ4Di8T_SKp_ufulxyEcXOQLNoy2-wFs8v6R4";
const GOOGLE_PLACES_API_KEY = "AIzaSyAUU3CIdUUOe49DTiS5_i9GMe_mjIpC09c";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("=== Re-sync Missing Opening Hours ===\n");

  // Step 1: Query restaurants with missing opening_hours but valid google_place_id
  console.log("Fetching restaurants with missing opening hours...");
  const queryUrl = `${SUPABASE_URL}/rest/v1/mall_restaurants?select=id,name,mall_id,google_place_id&opening_hours=is.null&google_place_id=not.is.null`;

  const queryRes = await fetch(queryUrl, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!queryRes.ok) {
    console.error(
      "Failed to query Supabase:",
      queryRes.status,
      await queryRes.text(),
    );
    process.exit(1);
  }

  const restaurants = await queryRes.json();
  console.log(
    `Found ${restaurants.length} restaurants with missing opening hours.\n`,
  );

  if (restaurants.length === 0) {
    console.log(
      "Nothing to do. All restaurants have opening hours or no place ID.",
    );
    return;
  }

  let updated = 0;
  let stillMissing = 0;
  let errors = 0;

  // Step 2: For each restaurant, fetch opening hours from Google Places API (New)
  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    console.log(
      `[${i + 1}/${restaurants.length}] ${r.name} (mall_id: ${r.mall_id}) - place_id: ${r.google_place_id}`,
    );

    try {
      const placesUrl = `https://places.googleapis.com/v1/places/${r.google_place_id}`;
      const placesRes = await fetch(placesUrl, {
        headers: {
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "displayName,currentOpeningHours,regularOpeningHours",
        },
      });

      if (!placesRes.ok) {
        const errText = await placesRes.text();
        console.log(
          `  ERROR: Google Places API returned ${placesRes.status}: ${errText}`,
        );
        errors++;
        await delay(200);
        continue;
      }

      const placeData = await placesRes.json();
      const weekdayDescriptions =
        placeData?.currentOpeningHours?.weekdayDescriptions ||
        placeData?.regularOpeningHours?.weekdayDescriptions;

      if (!weekdayDescriptions || weekdayDescriptions.length === 0) {
        console.log("  No opening hours available from Google Places.");
        console.log(
          "  API response:",
          JSON.stringify(placeData).substring(0, 200),
        );
        stillMissing++;
        await delay(200);
        continue;
      }

      // Step 3: Update Supabase with the opening hours
      const updateUrl = `${SUPABASE_URL}/rest/v1/mall_restaurants?id=eq.${r.id}`;
      const updateRes = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          opening_hours: JSON.stringify(weekdayDescriptions),
        }),
      });

      if (!updateRes.ok) {
        const errText = await updateRes.text();
        console.log(
          `  ERROR: Failed to update Supabase: ${updateRes.status}: ${errText}`,
        );
        errors++;
        await delay(200);
        continue;
      }

      console.log(`  Updated with ${weekdayDescriptions.length} day entries.`);
      console.log(`  Sample: ${weekdayDescriptions[0]}`);
      updated++;
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      errors++;
    }

    // Rate limit delay
    await delay(200);
  }

  // Step 4: Report results
  console.log("\n=== Results ===");
  console.log(`Total restaurants processed: ${restaurants.length}`);
  console.log(`Successfully updated:        ${updated}`);
  console.log(`Still missing (no data):     ${stillMissing}`);
  console.log(`Errors:                      ${errors}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
