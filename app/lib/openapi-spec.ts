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
    // Removed /wellbeing and /wellbeing/{id} paths as WellbeingEntry is merged into SleepEntry

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
        summary: "Create a new sleep and daily well-being entry",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/SleepInput" }
            }
          }
        },
        responses: {
          "201": {
            description: "Successfully added to the database",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" }
                    // Backend returns only message for sleep POST
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
    "/sleep/{id}": {
      "get": {
        summary: "Retrieve a single sleep and daily well-being entry by ID",
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
                    data: { "$ref": "#/components/schemas/SleepEntry" }
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
        summary: "Update an existing sleep and daily well-being entry by ID",
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
          "200": {
            description: "Sleep entry updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { "$ref": "#/components/schemas/SleepEntry" }
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
      "delete": {
        summary: "Delete a sleep and daily well-being entry by ID",
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
          "200": {
            description: "Successfully deleted item",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { "$ref": "#/components/schemas/SleepEntry" }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      }
    },
    "/insights/AI/correlation": {
      "get": {
        summary: "Get AI-powered correlation analysis",
        parameters: [
          {
            name: "period",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["weekly", "monthly", "all"]
            },
            description: "The period over which to analyze the correlation."
          }
        ],
        responses: {
          "200": {
            description: "Successfully retrieved AI correlation insight",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/AIInsightResponse" }
              }
            }
          },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      }
    },
    "/insights/AI/overview": {
      "get": {
        summary: "Get AI-powered overview of sleep and well-being",
        parameters: [
          {
            name: "period",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["weekly", "monthly", "all"]
            },
            description: "The period over which to generate the overview."
          }
        ],
        responses: {
          "200": {
            description: "Successfully retrieved AI overview insight",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/AIInsightResponse" }
              }
            }
          },
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
    },
    "/insights/summary": {
      "get": {
        summary: "Provides a summary of the user's sleep patterns and well-being over a period.",
        parameters: [
          {
            name: "period",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["week", "month", "all"]
            },
            description: "Optional period for the summary (e.g., 'week', 'month', 'all')."
          },
          {
            name: "startDate",
            in: "query",
            required: false,
            schema: {
              type: "string",
              format: "date-time"
            },
            description: "Optional start date for the summary (ISO 8601 format). Must be used with endDate."
          },
          {
            name: "endDate",
            in: "query",
            required: false,
            schema: {
              type: "string",
              format: "date-time"
            },
            description: "Optional end date for the summary (ISO 8601 format). Must be used with startDate."
          }
        ],
        responses: {
          "200": {
            description: "Successfully fetched summary data",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/SummaryResponse" }
              }
            }
          },
          "400": { "$ref": "#/components/responses/BadRequestError" },
          "404": { "$ref": "#/components/responses/NotFoundError" },
          "500": { "$ref": "#/components/responses/ServerError" }
        }
      }
    },
    "/insights/chartsdata": {
      "get": {
        summary: "Retrieve all data needed for analytics charts and AI insights.",
        parameters: [
          {
            name: "period",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["week", "month", "all"]
            },
            description: "The period over which to retrieve chart data and insights."
          },
          {
            name: "startDate",
            in: "query",
            required: false,
            schema: {
              type: "string",
              format: "date-time"
            },
            description: "Optional start date for the data (ISO 8601 format). Must be used with endDate."
          },
          {
            name: "endDate",
            in: "query",
            required: false,
            schema: {
              type: "string",
              format: "date-time"
            },
            description: "Optional end date for the data (ISO 8601 format). Must be used with startDate."
          }
        ],
        responses: {
          "200": {
            description: "Successfully retrieved all charts data and AI insights",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/ChartsDataResponse" }
              }
            }
          },
          "400": { "$ref": "#/components/responses/BadRequestError" },
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
      // Removed WellbeingInput, WellbeingEntry, WellbeingUpdateInput schemas

      "SleepInput": {
        type: "object",
        properties: {
          bedtime: { type: "string", format: "date-time", description: "Time user went to bed." },
          wakeUpTime: { type: "string", format: "date-time", description: "Time user woke up." },
          qualityRating: { type: "integer", minimum: 1, maximum: 10, description: "Rating of sleep quality (1-10)." },
          sleepcomments: { type: "string", nullable: true, description: "Optional comments on sleep." },
          durationHours: { type: "number", format: "float", nullable: true, description: "Optional pre-calculated sleep duration in hours." },
          entryDate: { type: "string", format: "date-time", description: "Date of the entry (ISO 8601 format)." },
          dayRating: { type: "integer", minimum: 1, maximum: 10, description: "Rating of the day from 1 to 10." },
          mood: { "$ref": "#/components/schemas/Mood", nullable: true, description: "Optional mood for the day." },
          daycomments: { type: "string", nullable: true, description: "Optional comments for the day." },
        },
        required: ["bedtime", "wakeUpTime", "qualityRating", "entryDate", "dayRating"]
      },
      "SleepEntry": {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", description: "Unique ID of the sleep entry." },
          userId: { type: "string", format: "uuid", nullable: true, description: "ID of the user." },
          bedtime: { type: "string", format: "date-time", description: "Bedtime." },
          wakeUpTime: { type: "string", format: "date-time", description: "Wake up time." },
          qualityRating: { type: "integer", minimum: 1, maximum: 10, description: "Quality rating." },
          sleepcomments: { type: "string", nullable: true, description: "Comments on sleep." },
          durationHours: { type: "number", format: "float", nullable: true, description: "Calculated duration in hours." },
          entryDate: { type: "string", format: "date-time", description: "Date of the entry." },
          dayRating: { type: "integer", minimum: 1, maximum: 10, description: "Rating of the day (1-10)." },
          mood: { "$ref": "#/components/schemas/Mood", nullable: true, description: "Mood for the day." },
          daycomments: { type: "string", nullable: true, description: "Comments for the day." },
          createdAt: { type: "string", format: "date-time", description: "Creation timestamp." },
          updatedAt: { type: "string", format: "date-time", description: "Last update timestamp." }
        },
        required: ["id", "bedtime", "wakeUpTime", "qualityRating", "entryDate", "dayRating", "createdAt", "updatedAt"]
      },
      "SleepUpdateInput": {
        type: "object",
        properties: {
            bedtime: { type: "string", format: "date-time", description: "Optional new bedtime." },
            wakeUpTime: { type: "string", format: "date-time", description: "Optional new wake up time." },
            qualityRating: { type: "integer", minimum: 1, maximum: 10, description: "Optional new quality rating (1-10)." },
            sleepcomments: { type: "string", nullable: true, description: "Optional new comments on sleep." },
            durationHours: { type: "number", format: "float", nullable: true, description: "Optional new duration in hours." },
            entryDate: { type: "string", format: "date-time", description: "Optional new date for the entry." },
            dayRating: { type: "integer", minimum: 1, maximum: 10, description: "Optional new day rating (1-10)." },
            mood: { "$ref": "#/components/schemas/Mood", nullable: true, description: "Optional new mood." },
            daycomments: { type: "string", nullable: true, description: "Optional new comments for the day." },
        }
      },
      "SummaryResponse": {
        type: "object",
        properties: {
          message: { type: "string" },
          summary: {
            type: "object",
            properties: {
              averageSleepDurationHours: { type: "number", format: "float", nullable: true, description: "Average sleep duration in hours." },
              bestSleepDays: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", format: "date", description: "Date of the best sleep day (YYYY-MM-DD)." },
                    qualityRating: { type: "integer", description: "Quality rating for that day." }
                  },
                  required: ["date", "qualityRating"]
                },
                description: "List of days with the best sleep quality."
              },
              worstSleepDays: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", format: "date", description: "Date of the worst sleep day (YYYY-MM-DD)." },
                    qualityRating: { type: "integer", description: "Quality rating for that day." }
                  },
                  required: ["date", "qualityRating"]
                },
                description: "List of days with the worst sleep quality."
              },
              averageDayRating: { type: "number", format: "float", nullable: true, description: "Average day rating." }
            },
            required: ["averageSleepDurationHours", "bestSleepDays", "worstSleepDays", "averageDayRating"]
          }
        },
        required: ["message", "summary"]
      },
      "ChartsDataResponse": {
        type: "object",
        properties: {
          moodChartData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date for the chart point (e.g., 'Jul 20')." },
                moodValue: { type: "number", description: "Numeric representation of mood (1-5)." },
                mood: { "$ref": "#/components/schemas/Mood", nullable: true, description: "Original mood string." }
              },
              required: ["date", "moodValue"]
            },
            description: "Data for the mood trend chart."
          },
          sleepDurationChartData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date for the chart point (e.g., 'Sat')." },
                sleepDuration: { type: "number", format: "float", description: "Sleep duration in hours." }
              },
              required: ["date", "sleepDuration"]
            },
            description: "Data for the sleep duration chart."
          },
          correlationChartData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sleepDuration: { type: "number", format: "float", description: "Sleep duration in hours." },
                dayRating: { type: "integer", description: "Day rating (1-10)." },
                date: { type: "string", format: "date", description: "Date of the entry (YYYY-MM-DD)." }
              },
              required: ["sleepDuration", "dayRating", "date"]
            },
            description: "Data for the sleep and day rating correlation chart."
          },
          aiCorrelationInsight: { type: "string", description: "AI-generated insight about correlation." },
        },
        required: [
          "moodChartData",
          "sleepDurationChartData",
          "correlationChartData",
          "aiCorrelationInsight",
        ]
      },
      "ErrorResponse": {
        type: "object",
        properties: {
          error: { type: "string", description: "Error message." },
          details: { type: "array", items: { type: "object" }, description: "Optional details about the error (e.g., Zod validation errors)." },
          errorType: { type: "string", enum: ["ZodError", "PrismaError", "UnknownError"], description: "Type of error." }
        },
        required: ["error"]
      },
      "AIInsightResponse": {
        type: "object",
        properties: {
          insight: { type: "string", description: "The AI-generated insight." }
        },
        required: ["insight"]
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
