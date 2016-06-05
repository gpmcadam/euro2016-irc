'use strict';

const sendHelpSummary = (command, client, helpMapping, commands) => {
    const commandsHelp = commands.map(command => `!${command}`).join(', ');
    client.say(command.to, `${command.from}: Available commands: ${commandsHelp}`);
    client.say(command.to, `${command.from}: See !help [command] for additional help.`);
};

const sendHelp = (command, client, commandName, help) => {
    client.say(command.to, `${command.from}: !${commandName} ${help.usage}`);
    client.say(command.to, `${command.from}:     ${help.desc}`);
    if (help.example) {
        client.say(command.to, `${command.from}: Examples:`);
        help.example.forEach(example => {
            client.say(command.to, `${command.from}: !${commandName} ${example}`);
        });
    }
};

module.exports = (command, client, helpMapping, commands) => {
    commands = commands.filter(command => command !== 'help');
    if (command.args.length < 1) {
        return sendHelpSummary(command, client, helpMapping, commands);
    }
    if (commands.indexOf(command.text) === -1) {
        return client.say(command.to, `${command.from}: No such command "${command.text}"`);
    }
    let helpForCommand = helpMapping[command.text];
    if (!helpForCommand) {
        for (const h in helpMapping) {
            if (!helpMapping.hasOwnProperty(h)) {
                continue;
            }
            const mapping = helpMapping[h];
            if (!mapping.aliases) {
                continue;
            }
            if (mapping.aliases.indexOf(command.text) !== -1) {
                helpForCommand = mapping;
                break;
            }
        }
    }
    if (!helpForCommand) {
        return client.say(command.to, `${command.from}: No additional help`);
    }
    return sendHelp(command, client, command.text, helpForCommand);
};
