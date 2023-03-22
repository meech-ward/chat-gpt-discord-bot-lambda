// Import necessary packages
import { InteractionResponseType, InteractionType, userMention } from 'discord.js'
import nacl from 'tweetnacl'
import { promptMessage } from './gpt'
import axios from 'axios'

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

// Helper function to create a response object
const createResponse = (type, content) => ({
  type: type,
  data: {
    content: content
  }
});

// Main Lambda function handler
export async function handle(event) {
  // Verify the request is from Discord
  const signature = event.headers['x-signature-ed25519'];
  const timestamp = event.headers['x-signature-timestamp'];
  const isValidRequest = verifyDiscordRequest(event.body, signature, timestamp, PUBLIC_KEY);

  if (!isValidRequest) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid request' }),
    };
  }

  // Parse the interaction payload
  const interaction = JSON.parse(event.body);

  // Handle interaction types
  switch (interaction.type) {
    case InteractionType.Ping:
      return { type: InteractionResponseType.Pong }

    case InteractionType.ApplicationCommand:

      const options = interaction.data.options;
      const user = interaction.member.user;
      let question = options?.[0]?.value;
      const includeQuestion = !!question
      const name = interaction.data.name;
      const type = name == "helpme" ? "helpful" : "sarcastic";

      if (!question) {
        // If no question was provided:
        // * if it's a thread, get the first messsage
        // * otherwise, get the last message that was sent before this one

        const { data: channel } = await axios.get(`https://discord.com/api/v10/channels/${interaction.channel_id}`, {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
          }
        })
        const isThread = channel.type == 11

        if (!isThread) {
          // get the previous message that was sent in that channel
          const { data: messages } = await axios.get(`https://discord.com/api/v8/channels/${interaction.channel_id}/messages?limit=1`, {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
          })
          const previousMessage = messages[0]
          question = previousMessage.content
        } else {
          // get the last message in the thread
          const { data: messages } = await axios.get(`https://discord.com/api/v8/channels/${interaction.channel_id}/messages?limit=100`, {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
          })
          const firstMessage = messages[messages.length - 1]
          question = firstMessage.referenced_message.content
        }
      }

      // Send the initial response
      const initialResponse = createResponse(
        InteractionResponseType.ChannelMessageWithSource,
        `${userMention(user.id)}: ${user.id == 664585823571935238 ? "Hi saM" : "Hold on I'm thinking..."}`
      );
      await axios.post(`https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`, initialResponse);


      // Call the promptMessage function (GPT)
      console.log({ question, name, type })
      const { answer, error } = await promptMessage({ message: question, type }).then(answer => ({ answer })).catch(error => ({ error }));
      console.log({ answer, error })

      // Send the updated message with the answer to Discord
      const followupMessage = {
        content: `${userMention(user.id)}${includeQuestion ? ": " + question + "\n\n" : "\n"}${error ? "GPT Error" : answer}`,
      }

      try {
        await axios.patch(`https://discord.com/api/v8/webhooks/${CLIENT_ID}/${interaction.token}/messages/@original`, followupMessage)
      } catch (error) {
        if (error.isAxiosError) {
          console.log(error.response.data)
        }
      } finally {
        // Return an empty response (since we've already sent responses using the API)
        return {}
      }

    default:
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Unhandled interaction type' }),
      };
  }
};

// Utility function to verify the Discord request
function verifyDiscordRequest(body, signature, timestamp, publicKey) {
  console.log({ body, signature, timestamp, publicKey })
  const msg = Buffer.concat([
    Buffer.from(timestamp, 'utf8'),
    Buffer.from(body, 'utf8')
  ]);
  const sig = Buffer.from(signature, 'hex');
  const pubKey = Buffer.from(publicKey, 'hex');

  return nacl.sign.detached.verify(msg, sig, pubKey);
}