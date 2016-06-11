const mapCommand = (command, mapping, client) => {
    const commandName = command.name.toLowerCase();
    if (!mapping[commandName]) {
        return false;
    }
    return mapping[commandName](command, client);
};

const isCommand = message => {
    return message.substring(0, 1) === '!';
};

const parseCommand = (message, from, to) => {
    if (!isCommand(message)) {
        return null;
    }
    const parts = message.split(' ');
    const name = parts.shift().substring(1);
    const text = parts.join(' ');
    return {
        name,
        args: parts,
        text,
        from,
        to
    };
};

module.exports = { mapCommand, isCommand, parseCommand };
