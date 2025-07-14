import { z } from 'zod';

const apiDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Sleep Tracker API",
    version: "1.0.0",
    description: "API for tracking sleep patterns, well-being, and insights.",
  },
  servers: [
    {
      url: "/api",
      description: "Local Development Server",
    },
  ],
  paths: {
    "/wellbeing": {
      "get": {
        summary: "Retrieve all wellbeing entries for the current user",
        responses: {
          "200": {
            description: "Successfully fetched wellbeing data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { type: "array", items: { "$ref": "#/components/schemas/WellbeingEntry" } }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      },
      "post": {
        summary: "Create a new wellbeing entry",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/WellbeingInput" }
            }
          }
        },
        responses: {
          "201": {
            description: "Wellbeing entry created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { "$ref": "#/components/schemas/WellbeingEntry" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/BadRequestError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      }
    },
    "/wellbeing/{id}": {
      "get": {
        summary: "Retrieve a single wellbeing entry by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Unique ID of the wellbeing entry.",
          },
        ],
        responses: {
          "200": {
            description: "Successfully fetched single wellbeing entry",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { "$ref": "#/components/schemas/WellbeingEntry" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/BadRequestError" },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      },
      "put": {
        summary: "Update an existing wellbeing entry by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Unique ID of the wellbeing entry to update.",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/WellbeingUpdateInput" }
            }
          }
        },
        responses: {
          "200": { description: "Wellbeing entry updated successfully" },
          "400": { "$ref": "#/components/responses/BadRequestError" },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      },
      "delete": {
        summary: "Delete a wellbeing entry by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Unique ID of the wellbeing entry to delete.",
          },
        ],
        responses: {
          "200": { description: "Wellbeing entry deleted successfully" },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      }
    },
    "/sleep": {
      "get": {
        summary: "Retrieve all sleep entries for the current user",
        responses: {
          "200": {
            description: "Successfully retrieved sleep entries",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { type: "array", items: { "$ref": "#/components/schemas/SleepEntry" } }
                  }
                }
              }
            }
          },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      },
      "post": {
        summary: "Create a new sleep entry",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/SleepInput" }
            }
          }
        },
        responses: {
          "201": { description: "Successfully added to the database" },
          "400": { "$ref": "#/components/responses/BadRequestError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      }
    },
    "/sleep/{id}": {
      "get": {
        summary: "Retrieve a single sleep entry by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Unique ID of the sleep entry.",
          },
        ],
        responses: {
          "200": {
            description: "Successfully fetched single sleep entry",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    body: { "$ref": "#/components/schemas/SleepEntry" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/BadRequestError" },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      },
      "put": {
        summary: "Update an existing sleep entry by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Unique ID of the sleep entry to update.",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/SleepUpdateInput" }
            }
          }
        },
        responses: {
          "200": { description: "Sleep entry updated successfully" },
          "400": { "$ref": "#/components/responses/BadRequestError" },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      },
      "delete": {
        summary: "Delete a sleep entry by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Unique ID of the sleep entry to delete.",
          },
        ],
        responses: {
          "200": { description: "Successfully deleted item" },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      }
    },
    "/insights/correlation": {
        "get": {
            summary: "Calculate correlation between sleep duration and day rating",
            responses: {
                "200": {
                    description: "Correlation calculated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string" },
                                    response: {
                                        type: "object",
                                        properties: {
                                            correlationCoefficient: { type: "number", format: "float" },
                                            dataPoints: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        sleepDuration: { type: "number", format: "float" },
                                                        dayRating: { type: "integer" },
                                                        date: { type: "string", format: "date" }
                                                    },
                                                    required: ["sleepDuration", "dayRating", "date"]
                                                }
                                            }
                                        },
                                        required: ["correlationCoefficient", "dataPoints"]
                                    }
                                }
                            }
                        }
                    }
                },
                "404": { "$ref": "#/components/responses/NotFoundError" },
                "500": { "$ref": "#/components/responses/ServerError" }
            }
        }
    }
  },
  components: {
    schemas: {
      "Mood": {
        type: "string",
        enum: ["Happy", "Stressed", "Neutral", "Sad", "Excited", "Tired"],
        description: "User's mood for the day.",
      },
      "WellbeingInput": {
        type: "object",
        properties: {
          entryDate: { type: "string", format: "date-time", description: "Date of the wellbeing entry (ISO 8601 format)." },
          dayRating: { type: "integer", minimum: 1, maximum: 10, description: "Rating of the day from 1 to 10." },
          mood: { "$ref": "#/components/schemas/Mood", nullable: true, description: "Optional mood for the day." },
          comments: { type: "string", nullable: true, description: "Optional comments for the entry." },
        },
        required: ["entryDate", "dayRating"],
      },
      "WellbeingEntry": {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", description: "Unique ID of the wellbeing entry." },
          userId: { type: "string", format: "uuid", description: "ID of the user this entry belongs to." },
          entryDate: { type: "string", format: "date-time", description: "Date of the wellbeing entry." },
          dayRating: { type: "integer", minimum: 1, maximum: 10, description: "Rating of the day (1-10)." },
          mood: { "$ref": "#/components/schemas/Mood", nullable: true, description: "Mood for the day." },
          comments: { type: "string", nullable: true, description: "Comments for the entry." },
          createdAt: { type: "string", format: "date-time", description: "Timestamp of creation." },
          updatedAt: { type: "string", format: "date-time", description: "Timestamp of last update." }
        },
        required: ["id", "userId", "entryDate", "dayRating", "createdAt", "updatedAt"]
      },
      "WellbeingUpdateInput": {
          type: "object",
          properties: {
              entryDate: { type: "string", format: "date-time", description: "Optional new date for the entry." },
              dayRating: { type: "integer", minimum: 1, maximum: 10, description: "Optional new day rating (1-10)." },
              mood: { "$ref": "#/components/schemas/Mood", nullable: true, description: "Optional new mood." },
              comments: { type: "string", nullable: true, description: "Optional new comments." }
          }
      },
      "SleepInput": {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid", description: "ID of the user (can be omitted if handled by middleware)." },
          bedtime: { type: "string", format: "date-time", description: "Time user went to bed." },
          wakeUpTime: { type: "string", format: "date-time", description: "Time user woke up." },
          qualityRating: { type: "integer", minimum: 1, maximum: 10, description: "Rating of sleep quality (1-10)." },
          comments: { type: "string", nullable: true, description: "Optional comments on sleep." },
          durationHours: { type: "number", format: "float", nullable: true, description: "Optional pre-calculated sleep duration in hours." }
        },
        required: ["bedtime", "wakeUpTime", "qualityRating"]
      },
      "SleepEntry": {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", description: "Unique ID of the sleep entry." },
          userId: { type: "string", format: "uuid", nullable: true, description: "ID of the user." },
          bedtime: { type: "string", format: "date-time", description: "Bedtime." },
          wakeUpTime: { type: "string", format: "date-time", description: "Wake up time." },
          qualityRating: { type: "integer", minimum: 1, maximum: 10, description: "Quality rating." },
          comments: { type: "string", nullable: true, description: "Comments." },
          durationHours: { type: "number", format: "float", nullable: true, description: "Calculated duration in hours." },
          createdAt: { type: "string", format: "date-time", description: "Creation timestamp." },
          updatedAt: { type: "string", format: "date-time", description: "Last update timestamp." }
        },
        required: ["id", "bedtime", "wakeUpTime", "qualityRating", "createdAt", "updatedAt"]
      },
      "SleepUpdateInput": {
        type: "object",
        properties: {
            bedtime: { type: "string", format: "date-time", description: "Optional new bedtime." },
            wakeUpTime: { type: "string", format: "date-time", description: "Optional new wake up time." },
            qualityRating: { type: "integer", minimum: 1, maximum: 10, description: "Optional new quality rating (1-10)." },
            comments: { type: "string", nullable: true, description: "Optional new comments." },
            durationHours: { type: "number", format: "float", nullable: true, description: "Optional new duration in hours." }
        }
      },
      "ErrorResponse": {
        type: "object",
        properties: {
          error: { type: "string", description: "Error message." },
          details: { type: "array", items: { type: "object" }, description: "Optional details about the error (e.g., Zod validation errors)." },
          errorType: { type: "string", enum: ["ZodError", "PrismaError", "UnknownError"], description: "Type of error." }
        },
        required: ["error"]
      }
    },
    responses: {
      "BadRequestError": {
        description: "Invalid input or bad request",
        content: {
          "application/json": {
            schema: { "$ref": "#/components/schemas/ErrorResponse" }
          }
        }
      },
      "NotFoundError": {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { "$ref": "#/components/schemas/ErrorResponse" }
          }
        }
      },
      "ServerError": {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { "$ref": "#/components/schemas/ErrorResponse" }
          }
        }
      }
    }
  }
};

export default apiDefinition;