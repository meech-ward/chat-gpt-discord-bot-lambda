import { handle } from "@gpt-bot/core/bot";

export async function handler(event, context) {

  try {
    const response = await handle(event)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response)
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: "There was an error :(" })
    }
  }
}