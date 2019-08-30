
/*
 * CLI-related tasks
 *
 */

 // Dependencies
 const readLine = require('readline');
 const util = require('util');
 const debug = util.debuglog('cli');
 const events = require('events');
 class _events extends events{};
 const e = new _events();
 const os = require('os');
 const v8 = require('v8');
 const _data = require('./data');
 const helpers = require('../helpers');

// Instantiate the cli module object
const cli = {};

// helpers
/**
 * Create a vertical space
 * @param {Number} lines
 */
cli.verticalSpace = (lines) => {
  lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
  for (let i = 0; i < lines; i++) {
    console.log('');
  }
};

/**
 * Create a horizontal line across the screen
 */
cli.horizontalLine = () => {
  // Get the available screen size
  const width = process.stdout.columns;
  // Put in enough dashes to go across the screen
  let line = '';
  for (let i = 0; i < width; i++) {
    line += '-';
  }
  console.log(line);
};

/**
 * Create centered text on the screen
 * @param {String} str
 */
cli.centered = (str) => {
  str = typeof str === 'string' && str.trim() ? str.trim() : '';

  // Get the available screen size
  const width = process.stdout.columns;

  // Calculate the left padding there should be
  const leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  let line = '';
  for (let i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  line += str;
  console.log(line);
};

// Input handlers
e.on('clear', () => {
  cli.responders.clear();
});

e.on('exit', () => {
  cli.responders.exit();
});

e.on('user', (str) => {
  cli.responders.user(str);
});

e.on('man', () => {
  cli.responders.help();
});

e.on('help', () => {
  cli.responders.help();
});

e.on('product', (str) => {
  cli.responders.product(str);
});

e.on('orders', (str) => {
  cli.responders.orders(str);
});

e.on('last sessions', () => {
  cli.responders.lastSessions();
});
// Responders object
cli.responders = {};
/**
 * Clear console
 */
cli.responders.clear = () => {
  process.stdout.write('\033c');
};
/**
 * Close app
 */
cli.responders.exit = () => {
  process.exit(0);  
};
/**
 * Product
 * params: --all, --one {product name}
 * example: product --one pizza
 */
cli.responders.product = async (str) => {
  let cmd = str;
  // Check if the command has a parameter
  cmd = cmd.split(' --');
  if (cmd.length > 1) {
    // delete the unique input from the cmd
    cmd = cmd.splice(1, cmd.length);
    cmd = cmd.join('');
    // split the parameter by key and value
    cmd = cmd.split(' ');
    const key = cmd[0].toLowerCase();
    const availableKeys = ['all', 'one'];
    if (availableKeys.some(x => x === key)) {
      cmd = cmd.splice(1, cmd.length);
      const data = await _data.list('products', false);
      if (key === 'all') {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          console.log("=================================");
          console.log(item);
          console.log("=================================");
        }
      } else {
        const val = cmd.join(' ').trim().toLowerCase(); 
        if (val) {
          const indx = data.findIndex(x => x.name === val);
          console.log(data[indx] || 'Product not found')
        } else {
          console.log('Invalid command, a value was expected after --' + key);
          cli.responders.help();
        }
      }
    } else {
      console.log('Invalid command');
      cli.responders.help();
    }
  }else {
    console.log('Invalid command');
    cli.responders.help();
  }
};

/**
 * Users
 * params: --all, --one {email}
 * example: user --one 'correo@correo'
 */
cli.responders.user = async (str) => {
  let cmd = str;
  // Check if the command has a parameter
  cmd = cmd.split(' --');
  if (cmd.length > 1) {
    // delete the unique input from the cmd
    cmd = cmd.splice(1, cmd.length);
    cmd = cmd.join('');
    // split the parameter by key and value
    cmd = cmd.split(' ');
    const key = cmd[0].toLowerCase();
    const availableKeys = ['all', 'one'];
    if (availableKeys.some(x => x === key)) {
      cmd = cmd.splice(1, cmd.length);
      const data = await _data.list('users', false);
      if (key === 'all') {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          delete item.password;
          console.log("=================================");
          console.log(item);
          console.log("=================================");
        }
      } else {
        const val = cmd.join(' ').trim().toLowerCase();
        if (val) {
          const indx = data.findIndex(x => x.email === val);
          console.log(data[indx] || 'User not found')
        } else {
          console.log('Invalid command, a value was expected after --' + key);
          cli.responders.help();
        }
      }
    } else {
      console.log('Invalid command');
      cli.responders.help();
    }
  }else {
    console.log('Invalid command');
    cli.responders.help();
  }
};
/**
 * Sessions
 */
cli.responders.lastSessions = async () => {
  const data = await _data.list('tokens', false);
  const day = 24 * 60 * 60 * 1000;
  const sessions = data.filter(x => x.expires >= Date.now() - day);
  if (sessions.length) {
    for (let i = 0; i < sessions.length; i++) {
      const {user, email} = sessions[i];
      console.log('==========================');
      console.log({user, email});
      console.log('==========================');
    }
  } else {
    console.log([]);
  }
};

/**
 * Orders
 * params: --last, --id {history id}
 * example: product --one pizza
 */
cli.responders.orders = async (str) => {
  let cmd = str;
  // Check if the command has a parameter
  cmd = cmd.split(' --');
  if (cmd.length > 1) {
    // delete the unique input from the cmd
    cmd = cmd.splice(1, cmd.length);
    cmd = cmd.join('');
    // split the parameter by key and value
    cmd = cmd.split(' ');
    const key = cmd[0].toLowerCase();
    const availableKeys = ['last', 'id'];
    if (availableKeys.some(x => x === key)) {
      cmd = cmd.splice(1, cmd.length);
      let data = await _data.list('history', false);
      if (key === 'last') {
        const day = 24 * 60 * 60 * 1000;
        data = data.filter(x => x.date >= Date.now() - day);
        if (data.length) {
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            delete item.payment_details;
            console.log("=================================");
            console.log(item);
            console.log("=================================");
          }
        } else {
          console.log([]);          
        }
      } else {
        const val = cmd.join(' ').trim().toLowerCase(); 
        if (val) {
          const indx = data.findIndex(x => x.id === val);
          const item = data[indx];
          if (item) {
            delete item.payment_details;
          }
          console.log(item || 'Order not found')
        } else {
          console.log('Invalid command, a value was expected after --' + key);
          cli.responders.help();
        }
      }
    } else {
      console.log('Invalid command');
      cli.responders.help();
    }
  }else {
    console.log('Invalid command');
    cli.responders.help();
  }
};


/**
 * help/man 
 */
// Help / Man
cli.responders.help = () => {
  // Codify the commands and their explanations
  const commands = {
    'exit': 'Kill the CLI (and the rest of the application).',
    'man': 'Show this help page.',
    'help': 'Alias of the "man" command.',
    'clear': 'It clears the screen or console window of commands.',
    'product, OPTIONS: --all, --one {product name} :': 'Show info about available products.',
    'user, OPTIONS: --all, --one {email} :': 'Show info about registed users.',
    'last sessions': 'Show the users who have signed up in the last 24 hours.',
    'orders, OPTIONS: --all, --id {value} :': 'Get a specific order by the id or get the all orders registered in the last 24 hours.',
  };

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively
  for (const key in commands) {
    if (commands.hasOwnProperty(key)) {
      var value = commands[key];
      var line = '      \x1b[33m '+key+'      \x1b[0m';
      var padding = 60 - line.length;
      for (let i = 0; i < padding; i++) {
        line+=' ';
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }
  cli.verticalSpace(1);
  // End with another horizontal line
  cli.horizontalLine();
};

// Input processor
cli.processInput = (str) => {
  str = typeof str === 'string' && str.trim() ? str.trim() : false;
  // Only process the unput if the user actually wrote something. Otherwise ignore
  if (str) {
    // Codify the unique strings that identify the different unique questions allowed be the asked
    const uniqueInputs = [
      'man',
      'help',
      'exit',
      'clear',
      'product',
      'user',
      'last sessions',
      'orders',
    ];
    // Go through the possible inputs, emit event if a there is a match
    const matchFound = uniqueInputs.findIndex(x => str.toLowerCase().indexOf(x) > -1);
    var counter = 0;
    if (matchFound > -1) {
      // Emit the event that matches with the unique input and include the full string given
      e.emit(uniqueInputs[matchFound], str);
    } else {
      // If there are no matches, return "try again"
      console.log("Sorry, try again");
    }
  }
}
// Init script
cli.init = () => {
  // Send the start message to the console, in dark blue
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

  // Start the interface
  const _interface = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
  });
  // Create an initial prompt
  _interface.prompt();
  // Handle each line of input splitly
  _interface.on('line', (str) => {
    // Send to the input processor
    cli.processInput(str);
    // Re-initialize the prompt afterwards
    _interface.prompt();
  });
  // If the user stops the CLI, kill the associated process
  _interface.on('close', () => {
    process.exit(0);
  });
};

module.exports = cli;
