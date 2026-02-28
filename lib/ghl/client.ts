/**
 * GoHighLevel API Client for BestFoodWhere
 *
 * Uses GHL API v2 with OAuth2 access/refresh tokens.
 * Tokens are stored in Supabase and automatically refreshed.
 */

import { createClient } from "@supabase/supabase-js";
import type {
  CreateContactInput,
  CreateContactResult,
  GHLContact,
  GHLOAuthTokens,
  GHLSearchResponse,
  GHLStoredTokens,
  GHLUpsertResponse,
} from "./types";

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

/** Buffer before expiry to trigger a proactive refresh (5 minutes) */
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export class GHLClient {
  private clientId: string;
  private clientSecret: string;
  private locationId: string;

  constructor(clientId?: string, clientSecret?: string, locationId?: string) {
    this.clientId = clientId || process.env.GHL_CLIENT_ID || "";
    this.clientSecret = clientSecret || process.env.GHL_CLIENT_SECRET || "";
    this.locationId = locationId || process.env.GHL_LOCATION_ID || "";

    if (!this.clientId) {
      throw new Error("GHL Client ID is required");
    }
    if (!this.clientSecret) {
      throw new Error("GHL Client Secret is required");
    }
    if (!this.locationId) {
      throw new Error("GHL Location ID is required");
    }
  }

  // ---------------------------------------------------------------------------
  // Token management
  // ---------------------------------------------------------------------------

  /**
   * Retrieve a valid access token for the configured location.
   * Reads from Supabase and refreshes automatically if expired or about to expire.
   */
  async getAccessToken(): Promise<string> {
    const { data, error } = await supabaseAdmin
      .from("ghl_oauth_tokens")
      .select("*")
      .eq("location_id", this.locationId)
      .single<GHLStoredTokens>();

    if (error || !data) {
      throw new Error(
        `No GHL OAuth tokens found for location ${this.locationId}. ` +
          "Please install the app via /api/crm/oauth/install first.",
      );
    }

    const expiresAt = new Date(data.expires_at).getTime();
    const now = Date.now();

    // If the token is still valid (with buffer), return it directly
    if (expiresAt - now > TOKEN_EXPIRY_BUFFER_MS) {
      return data.access_token;
    }

    // Token expired or about to expire -- refresh it
    return this.refreshAccessToken(data.refresh_token);
  }

  /**
   * Refresh the OAuth access token using the provided refresh token.
   * Persists the new token pair back to Supabase and returns the new access token.
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch(
      "https://services.leadconnectorhq.com/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("GHL token refresh failed:", errorBody);
      throw new Error(`GHL token refresh failed: ${response.status} - ${errorBody}`);
    }

    const tokens: GHLOAuthTokens = await response.json();
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();

    const { error } = await supabaseAdmin
      .from("ghl_oauth_tokens")
      .upsert(
        {
          location_id: this.locationId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "location_id" },
      );

    if (error) {
      console.error("Failed to persist refreshed GHL tokens:", error);
      throw new Error("Failed to persist refreshed GHL tokens");
    }

    return tokens.access_token;
  }

  // ---------------------------------------------------------------------------
  // HTTP helper
  // ---------------------------------------------------------------------------

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const accessToken = await this.getAccessToken();
    const url = `${GHL_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Version: GHL_API_VERSION,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`GHL API error: ${response.status}`, errorBody);
      throw new Error(`GHL API error: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }

  // ---------------------------------------------------------------------------
  // Contact methods (unchanged public API)
  // ---------------------------------------------------------------------------

  async getContactByEmail(email: string): Promise<GHLContact | null> {
    try {
      const params = new URLSearchParams({
        query: email.toLowerCase(),
        locationId: this.locationId,
      });

      const response = await this.request<GHLSearchResponse>(
        `/contacts/?${params.toString()}`,
      );

      if (response.contacts && response.contacts.length > 0) {
        return response.contacts[0];
      }

      return null;
    } catch (error) {
      console.error("Error searching for contact:", error);
      return null;
    }
  }

  async createOrUpdateContact(
    input: CreateContactInput,
  ): Promise<CreateContactResult> {
    try {
      const email = input.email.toLowerCase().trim();

      const body: Record<string, unknown> = {
        email,
        locationId: this.locationId,
        ...(input.firstName && { firstName: input.firstName }),
        ...(input.lastName && { lastName: input.lastName }),
        ...(input.phone && { phone: input.phone }),
        ...(input.tags && input.tags.length > 0 && { tags: input.tags }),
        ...(input.customFields && input.customFields.length > 0 && {
          customFields: input.customFields,
        }),
      };

      const response = await this.request<GHLUpsertResponse>(
        "/contacts/upsert",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );

      return {
        success: true,
        contactId: response.contact.id,
        isNew: response.new,
      };
    } catch (error) {
      console.error("Error creating/updating contact:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async addTags(
    contactId: string,
    tags: string[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/contacts/${contactId}/tags`, {
        method: "POST",
        body: JSON.stringify({ tags }),
      });

      return { success: true };
    } catch (error) {
      console.error("Error adding tags to contact:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getContactById(contactId: string): Promise<GHLContact | null> {
    try {
      const response = await this.request<{ contact: GHLContact }>(
        `/contacts/${contactId}`,
      );
      return response.contact;
    } catch (error) {
      console.error("Error getting contact by ID:", error);
      return null;
    }
  }
}

let clientInstance: GHLClient | null = null;

export function getGHLClient(): GHLClient {
  if (!clientInstance) {
    clientInstance = new GHLClient();
  }
  return clientInstance;
}
