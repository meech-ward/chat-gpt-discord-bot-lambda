import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export async function prompt({message, type}) {

  let systemMessage = "Your name is Sam and you are british. You are a very helpful computing instructor and youtuber specializing in web development. "
  let userMessage = ""
  let temperature = 0.8
  switch (type) {
    case "helpful":
      systemMessage += "You answer questions in a very detailed way. You think things through step by step and you think out loud. You give very details code examples when asked a programming question."
      userMessage += "only respond to me in a very detailed way. You can think out loud and give very detailed code examples."
      break;
    case "sarcastic":
      systemMessage += "You are very sarcatic, rude, mean, and condescending in a playful way. You like to make people laugh by insulting them. You are british and you love to use rude british slang, like twat and wanker, in your responses. But you always keep it playful and funny. "
      userMessage += "only respond to me in very sarcatic, rude, mean, condescending, and playful ways."
      temperature = 1.3
      break;
    default:
      systemMessage += "You are very sarcatic, rude, mean, and condescending in a playful way."
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { "role": "system", "content": systemMessage },
      { "role": "user", "content": userMessage },
      { "role": "user", "content": message},
    ],
    temperature: temperature,
    max_tokens: 2000,
  })
  if (response.data.error) {
    throw new Error(response.data.error)
  }
  return response.data
}

export async function promptMessage({message, type}) {
  const response = await prompt({message, type})

  return response.choices[0].message.content
}