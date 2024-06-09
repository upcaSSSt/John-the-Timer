import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { MS_MIN } from './global/global.js';

const ok = new ButtonBuilder()
  .setCustomId('ok')
  .setLabel('Ок')
  .setStyle(ButtonStyle.Danger);
const cancel = new ButtonBuilder()
  .setCustomId('cancel')
  .setLabel('Отмена')
  .setStyle(ButtonStyle.Secondary);
const row = new ActionRowBuilder()
  .addComponents(ok, cancel);

export default async function confirm(interaction, content, contentCancel, onOk) {
  const buttonsReply = await interaction.reply({ content, components: [row] });

  try {
    const confirmationResult = await buttonsReply.awaitMessageComponent({
      filter: i => i.user.id === interaction.user.id,
      time: MS_MIN,
    });

    if (confirmationResult.customId === 'ok') {
      const msgResult = await onOk();
      await confirmationResult.update({ content: msgResult, components: [] });
    }
    else
      await confirmationResult.update({ content: contentCancel, components: [] });
  }
  catch (err) {
    console.log(err);
    await interaction.editReply({ content: 'Подтверждение не пришло спустя 1 минуту, отменено', components: [] });
  }
}
