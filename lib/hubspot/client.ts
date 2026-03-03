/**
 * HubSpot API Client for BestFoodWhere
 *
 * Uses HubSpot Private App API for server-to-server communication.
 * Handles contact creation, updates, and list management.
 */

import type {
  CreateContactInput,
  CreateContactResult,
  HubSpotAPIContact,
  HubSpotContactProperties,
  HubSpotSearchResponse,
} from "./types";

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export class HubSpotClient {
  private accessToken: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.HUBSPOT_ACCESS_TOKEN || "";

    if (!this.accessToken) {
      throw new Error("HubSpot access token is required");
    }
  }

  /**
   * Make authenticated request to HubSpot API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${HUBSPOT_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HubSpot API error: ${response.status}`, errorBody);
      throw new Error(`HubSpot API error: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }

  /**
   * Search for contact by email
   */
  async getContactByEmail(email: string): Promise<HubSpotAPIContact | null> {
    try {
      const response = await this.request<HubSpotSearchResponse>(
        "/crm/v3/objects/contacts/search",
        {
          method: "POST",
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: "email",
                    operator: "EQ",
                    value: email.toLowerCase(),
                  },
                ],
              },
            ],
            properties: [
              "email",
              "firstname",
              "lastname",
              "phone",
              "bfw_source",
              "bfw_traffic_channel",
              "bfw_tags",
              "bfw_lead_score",
            ],
            limit: 1,
          }),
        },
      );

      if (response.results && response.results.length > 0) {
        return response.results[0];
      }

      return null;
    } catch (error) {
      console.error("Error searching for contact:", error);
      return null;
    }
  }

  /**
   * Create a new contact in HubSpot
   */
  async createContact(
    properties: Partial<HubSpotContactProperties>,
  ): Promise<HubSpotAPIContact> {
    // Convert properties to HubSpot format (all values as strings)
    const hubspotProperties: Record<string, string> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined && value !== null) {
        hubspotProperties[key] = String(value);
      }
    }

    return this.request<HubSpotAPIContact>("/crm/v3/objects/contacts", {
      method: "POST",
      body: JSON.stringify({ properties: hubspotProperties }),
    });
  }

  /**
   * Update an existing contact
   */
  async updateContact(
    contactId: string,
    properties: Partial<HubSpotContactProperties>,
  ): Promise<HubSpotAPIContact> {
    // Convert properties to HubSpot format
    const hubspotProperties: Record<string, string> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined && value !== null) {
        hubspotProperties[key] = String(value);
      }
    }

    return this.request<HubSpotAPIContact>(
      `/crm/v3/objects/contacts/${contactId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ properties: hubspotProperties }),
      },
    );
  }

  /**
   * Create or update a contact (upsert)
   * If contact exists by email, update it. Otherwise, create new.
   */
  async createOrUpdateContact(
    input: CreateContactInput,
  ): Promise<CreateContactResult> {
    try {
      const email = input.email.toLowerCase().trim();

      // Check if contact already exists
      const existingContact = await this.getContactByEmail(email);

      const properties: Partial<HubSpotContactProperties> = {
        email,
        ...(input.firstName && { firstname: input.firstName }),
        ...(input.lastName && { lastname: input.lastName }),
        ...(input.phone && { phone: input.phone }),
        ...input.properties,
      };

      if (existingContact) {
        // Update existing contact
        const updated = await this.updateContact(
          existingContact.id,
          properties,
        );
        return {
          success: true,
          contactId: updated.id,
          isNew: false,
        };
      } else {
        // Create new contact
        const created = await this.createContact(properties);
        return {
          success: true,
          contactId: created.id,
          isNew: true,
        };
      }
    } catch (error) {
      console.error("Error creating/updating contact:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Add contact to a static list
   */
  async addContactToList(
    contactId: string,
    listId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/contacts/v1/lists/${listId}/add`, {
        method: "POST",
        body: JSON.stringify({
          vids: [parseInt(contactId, 10)],
        }),
      });

      return { success: true };
    } catch (error) {
      console.error("Error adding contact to list:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get contact by ID
   */
  async getContactById(contactId: string): Promise<HubSpotAPIContact | null> {
    try {
      return await this.request<HubSpotAPIContact>(
        `/crm/v3/objects/contacts/${contactId}?properties=email,firstname,lastname,phone,bfw_source,bfw_traffic_channel,bfw_tags,bfw_lead_score`,
      );
    } catch (error) {
      console.error("Error getting contact by ID:", error);
      return null;
    }
  }
}

/**
 * Get singleton HubSpot client instance
 */
let clientInstance: HubSpotClient | null = null;

export function getHubSpotClient(): HubSpotClient {
  if (!clientInstance) {
    clientInstance = new HubSpotClient();
  }
  return clientInstance;
}
