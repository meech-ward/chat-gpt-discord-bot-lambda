const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('samgpt')
    .setDescription('Like saM but with gpt')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('send question, or leave blank to have it look at the previous message')
        .setRequired(false)
        .setMaxLength(2000)
        .setMinLength(0))
};
