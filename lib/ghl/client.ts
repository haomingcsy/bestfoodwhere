/**
 * GoHighLevel API Client for BestFoodWhere
 *
 * Uses GHL API v2 with a Private Integration API key.
 */

import type {
  CreateContactInput,
  CreateContactResult,
  CreateOpportunityInput,
  GHLContact,
  GHLOpportunity,
  GHLPipeline,
  GHLSearchResponse,
  GHLUpsertResponse,
  UpdateOpportunityInput,
} from "./types";

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

export class GHLClient {
  private apiKey: string;
  private locationId: string;

  constructor(apiKey?: string, locationId?: string) {
    this.apiKey = apiKey || process.env.GHL_API_KEY || "";
    this.locationId = locationId || process.env.GHL_LOCATION_ID || "";

    if (!this.apiKey) {
      throw new Error("GHL API Key is required");
    }
    if (!this.locationId) {
      throw new Error("GHL Location ID is required");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${GHL_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
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

  async updateContactById(
    contactId: string,
    data: { customFields: Array<{ id: string; field_value: string }> },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/contacts/${contactId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating contact:", error);
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

  // ============ Pipeline Methods ============

  async getPipelines(): Promise<GHLPipeline[]> {
    const response = await this.request<{ pipelines: GHLPipeline[] }>(
      `/opportunities/pipelines?locationId=${this.locationId}`,
    );
    return response.pipelines;
  }

  async getPipeline(pipelineId: string): Promise<GHLPipeline | null> {
    try {
      const response = await this.request<GHLPipeline>(
        `/opportunities/pipelines/${pipelineId}`,
      );
      return response;
    } catch {
      return null;
    }
  }

  // ============ Opportunity Methods ============

  async createOpportunity(
    input: CreateOpportunityInput,
  ): Promise<{ success: boolean; opportunityId?: string; error?: string }> {
    try {
      const response = await this.request<{ opportunity: GHLOpportunity }>(
        "/opportunities/upsert",
        {
          method: "POST",
          body: JSON.stringify({
            pipelineId: input.pipelineId,
            pipelineStageId: input.pipelineStageId,
            locationId: this.locationId,
            contactId: input.contactId,
            name: input.name,
            status: input.status || "open",
            monetaryValue: input.monetaryValue || 0,
            source: input.source || "BFW Website",
          }),
        },
      );
      return { success: true, opportunityId: response.opportunity.id };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("GHL create opportunity error:", errMsg);
      return { success: false, error: errMsg };
    }
  }

  async updateOpportunity(
    opportunityId: string,
    input: UpdateOpportunityInput,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request<{ opportunity: GHLOpportunity }>(
        `/opportunities/${opportunityId}`,
        {
          method: "PUT",
          body: JSON.stringify(input),
        },
      );
      return { success: true };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("GHL update opportunity error:", errMsg);
      return { success: false, error: errMsg };
    }
  }

  async getOpportunity(
    opportunityId: string,
  ): Promise<GHLOpportunity | null> {
    try {
      const response = await this.request<{ opportunity: GHLOpportunity }>(
        `/opportunities/${opportunityId}`,
      );
      return response.opportunity;
    } catch {
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
