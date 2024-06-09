import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Collection, Events } from 'discord.js';
import { datesDb } from './db.js';
import { client, notices } from './src/global/global.js';
import { dates, initDates, sendDeprecated } from './src/date-handler.js';

//const { token } = JSON.parse(readFileSync('./config.json'));
const mainDir = dirname(fileURLToPath(import.meta.url));

client.commands = new Collection();

const commandsPath = join(mainDir, 'src', 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(filePath); // eslint-disable-line no-await-in-loop
  if ('data' in command && 'execute' in command)
    client.commands.set(command.data.name, command);
  else
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
}

client.once(Events.ClientReady, async c => {
  await datesDb.sync();
  /*await datesDb.create({
    guildId: '1033460228697620530',
    noticeChannelId: '1034126907396067348',
    defaultOffset: 3,
    notices: '{}',
    PastDate: '[]',
    CountdownDate: '[]',
    LongDate: '[]',
    MultiDate: '[]',
  });*/
  /*await datesDb.update(
    {
      noticeChannelId: '1034126907396067348',
      defaultOffset: 3,
      notices: '{}',
      PastDate: '[]',
      CountdownDate: '[]',
      LongDate: '[]',
      MultiDate: '[]',
    },
    { where: { guildId: '1033460228697620530' }
  });*/
  await initDates();
  await sendDeprecated();
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    }
    catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred)
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      else
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
  else if (interaction.isAutocomplete()) {
    try {
      await complete(interaction);
    }
    catch (error) {
      console.error(error);
    }
  }
});

client.on(Events.GuildCreate, async g => {
  console.log("Joined a new guild: " + g.id);
  dates[g.id] = [];
  notices[g.id] = {};
  
  try {
		await datesDb.create({
			guildId: g.id,
      noticeChannelId: '',
      defaultOffset: 3,
      notices: '{}',
      PastDate: '[]',
      CountdownDate: '[]',
      LongDate: '[]',
      MultiDate: '[]',
		});
	}
	catch (err) {
	  if (err.name === 'SequelizeUniqueConstraintError')
			console.log('That tag already exists');
    else
		  console.log('Something went wrong with adding a tag');
	}
});

client.on(Events.GuildDelete, async g => {
  delete dates[g.id];
  delete notices[g.id];
  
  const n = await datesDb.destroy({ where: { guildId: g.id } });
	if (n > 0)
    console.log('Tag deleted');
  else
    console.log('That tag doesn\'t exist');
});

export async function complete(interaction) {
  const focusedValue = interaction.options.getFocused();
  const choices = dates[interaction.guild.id].map((d, i) => [d.name, i + 1]);
  const filtered = choices.filter(choice => choice[0].startsWith(focusedValue));
  await interaction.respond(filtered.map(choice => ({ name: choice[0], value: choice[1] })));
}
