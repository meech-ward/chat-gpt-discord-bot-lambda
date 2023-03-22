import { promptMessage } from "@gpt-bot/core/gpt";

// type Type = "helpful" | "sarcastic";
export async function handler(event, context) {
  const { message, type } = JSON.parse(event.body)
  try {
    const response = await promptMessage({message, type: type || "sarcastic"})
    return {
      statusCode: 200,
      body: JSON.stringify({ response })
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "There was an error :(" })
    }
  }
}