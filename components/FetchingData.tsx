import {
  TypeOfDataFromFrontEnd,
  wellbeingPutType,
  wellBeingReceingSchemaDB,
  singleWellBeingReceingSchemaDB
} from "@/app/lib/wellbeing";
import {
  SingleSleepRouteEntry,
  CreateSleepEntryInput,
  UpdatingSleepType,
} from "../app/lib/sleep";
import { CorrelationResponse } from "@/app/lib/utllity";
import {
  SleepInsightsResponse,
  GetSleepInsightsParams,
} from "@/app/lib/insight";

const getErrorMessage = async (res: Response): Promise<string> => {  /// this cant be in the utilities because it raise prisma use in client-side so I should make this stay here
  try {
    const errorData = await res.json();
    if (typeof errorData.error === 'string' && errorData.error.length > 0) {
      return errorData.error;
    }
    if (typeof errorData.message === 'string' && errorData.message.length > 0) {
      return errorData.message;
    }
    if (Array.isArray(errorData.error) && errorData.error.length > 0 && errorData.error[0].message) {
      return `Validation Error: ${errorData.error[0].message}`;
    }
  } catch (e) {
    console.error("Failed to parse error response JSON or no specific error/message field:", e);
  }
  return res.statusText || 'Unknown error occurred';
};



//--- get requests without ID -------------------------//

  export const getSleepEntry = async (): Promise<{
  message: string;
  data: SingleSleepRouteEntry[];
}> => {
  const res = await fetch("/api/sleep");
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(`Failed to fetch sleep entries: ${errorMessage}`);
  }
  return res.json();
};

export const getWellbeing = async (): Promise<{message: string,  data: wellBeingReceingSchemaDB}> => {
  const res = await fetch("/api/wellbeing");

  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to get wellbeing entries: ${errorMessage}`
    );
  }

  return res.json();
};


export const getInsightCorrelation = async (): Promise<{message: string, response: CorrelationResponse}> => {
  const res = await fetch("/api/insights/correlation");

  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to get insight correlation: ${errorMessage}`
    );
  }

  return res.json();
};

export const getInsightsSummary = async (
  params?: GetSleepInsightsParams
): Promise<SleepInsightsResponse> => {
  const queryParams = new URLSearchParams();
  const baseUrl = "/api/insights/summary";
  if (params?.period) {
    queryParams.append("period", params.period);
  } else if (params?.startDate && params?.endDate) {
    queryParams.append("startDate", params.startDate);
    queryParams.append("endDate", params.endDate);
  } else {
    throw new Error("Period or a valid startDate/endDate pair must be provided for insights summary.");
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  const res = await fetch(url);
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to fetch sleep insights: ${errorMessage}`
    );
  }
  return res.json();
};


//--- get requests with ID -------------------------//

export const getSingleSleepEntry = async (
  id: string
): Promise<{
  message: string;
  data: SingleSleepRouteEntry;
}> => {
  const res = await fetch(`/api/sleep/${id}`);
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to fetch single sleep entry: ${errorMessage}`
    );
  }
  return res.json();
};

export const getSingleWellbeingEntry = async (
  id: string
): Promise<{
  message: string;
  data: singleWellBeingReceingSchemaDB;
}> => {
  const res = await fetch(`/api/wellbeing/${id}`);
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to fetch single wellbeing entry: ${errorMessage}`
    );
  }
  return res.json();
};

//-----------POST requests --------------------------//

export const CreateSleepEntry = async (
  newSleepEntryData: CreateSleepEntryInput
): Promise<{ message: string }> => {
  const res = await fetch("/api/sleep", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newSleepEntryData),
  });

  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to create sleep entry: ${errorMessage}`
    );
  }

  return res.json();
};

export const CreateWellbeingEntry = async (
  newWellbeingEntryData: TypeOfDataFromFrontEnd
): Promise<{ message: string; data: singleWellBeingReceingSchemaDB }> => {
  const res = await fetch("/api/wellbeing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newWellbeingEntryData),
  });

  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to create wellbeing entry: ${errorMessage}`
    );
  }

  return res.json();
};

//-------------------PUT requests -----------------------------//

export const updateSingleSleepEntry = async (
  id: string,
  updateSleepEntryData: UpdatingSleepType
): Promise<{ message: string; data: SingleSleepRouteEntry }> => {
  const res = await fetch(`/api/sleep/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateSleepEntryData),
  });
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to update sleep entry: ${errorMessage}`
    );
  }
  return res.json();
};

export const updateSingleWellbeingEntry = async (
  id: string,
  updateWellbeingEntryData: wellbeingPutType
): Promise<{ message: string; data: singleWellBeingReceingSchemaDB }> => {
  const res = await fetch(`/api/wellbeing/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateWellbeingEntryData),
  });
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to update wellbeing entry: ${errorMessage}`
    );
  }
  return res.json();
};

//---------------Delete-------------------------------------------//

export const deleteSingleSleepEntry = async (
  id: string
): Promise<{ message: string; data: SingleSleepRouteEntry }> => {
  const res = await fetch(`/api/sleep/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to delete sleep entry: ${errorMessage}`
    );
  }
  return res.json();
};

export const deleteSingleWellbeingEntry = async (
  id: string
): Promise<{ message: string; data: singleWellBeingReceingSchemaDB }> => {
  const res = await fetch(`/api/wellbeing/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(
      `Failed to delete wellbeing entry: ${errorMessage}`
    );
  }
  return res.json();
};