const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('helpme')
    .setDescription('Get help from the bot')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('send question, or leave blank to have it look at the previous message')
        .setRequired(false)
        .setMaxLength(2000)
        .setMinLength(0))
};
