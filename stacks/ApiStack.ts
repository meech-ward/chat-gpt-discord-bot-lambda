import { StackContext, Api, Function } from "sst/constructs";

export function ApiStack({ stack, app }: StackContext) {
  const { stage } = app;
  // https://docs.sst.dev/constructs/Api
  const gptFunc = {
    handler: "packages/functions/src/lambda.handler",
    timeout: 60 * 5,
    memorySize: 1024,
    environment: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION!
    },
  }
  const botFunc = {
    handler: "packages/functions/src/bot.handler",
    // functionName: "sam-gpt-bot-func",
    timeout: 60 * 5,
    memorySize: 1024,
    environment: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION!,
      DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY!,
      DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID!,
      DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN!
    },
  }

  const api = new Api(stack, "api", {
    routes: {
      "POST /": {
        function: gptFunc
      },
      "POST /bot": {
        function: botFunc
      }
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
