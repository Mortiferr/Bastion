/**
 * @file give command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

const string = require('../../handlers/languageHandler');

exports.run = async (Bastion, message, args) => {
  if (args.length < 2 || (isNaN(args[0] = parseInt(args[0])) || args[0] < 1)) {
    /**
     * The command was ran with invalid parameters.
     * @fires commandUsage
     */
    return Bastion.emit('commandUsage', message, this.help);
  }

  let user = message.mentions.users.first();
  if (parseInt(args[1]) < 9223372036854775807) {
    user = Bastion.users.get(args[1]);
  }
  if (!user) {
    /**
     * Error condition is encountered.
     * @fires error
     */
    return Bastion.emit('error', string('invalidInput', 'errors'), string('giveNoUser', 'errorMessage'), message.channel);
  }

  if (Bastion.credentials.ownerId.includes(message.author.id)) {
    Bastion.emit('userDebit', user, args[0]);

    /**
     * Send a message in the channel to let the Bot Owner know that the operation was successful.
     */
    message.channel.send({
      embed: {
        color: Bastion.colors.GREEN,
        description: `You've awarded **${args[0]}** Bastion Currencies to <@${user.id}>.`
      }
    }).catch(e => {
      Bastion.log.error(e);
    });

    /**
     * Let the user know by DM that their account has been debited.
     */
    user.send({
      embed: {
        color: Bastion.colors.GREEN,
        description: `Your account has been debited with **${args[0]}** Bastion Currencies.`
      }
    }).catch(e => {
      Bastion.log.error(e);
    });
  }
  else {
    if (message.author.id === user.id) {
      /**
       * Error condition is encountered.
       * @fires error
       */
      return Bastion.emit('error', string('forbidden', 'errors'), string('giveYourself', 'errorMessage'), message.channel);
    }

    try {
      let sender = await Bastion.db.get(`SELECT bastionCurrencies FROM profiles WHERE userID=${message.author.id}`);
      sender.bastionCurrencies = parseInt(sender.bastionCurrencies);

      if (sender.bastionCurrencies < args[0]) {
        /**
        * Error condition is encountered.
        * @fires error
        */
        return Bastion.emit('error', string('insufficientBalance', 'errors'), string('insufficientBalance', 'errorMessage', sender.bastionCurrencies), message.channel);
      }

      let giveLimit = 0.5;
      if (args[0] >= giveLimit * sender.bastionCurrencies) {
        /**
        * Error condition is encountered.
        * @fires error
        */
        return Bastion.emit('error', string('invalidInput', 'errors'), string('giveLimit', 'errorMessage', giveLimit * 100), message.channel);
      }

      Bastion.emit('userDebit', user, args[0]);
      Bastion.emit('userCredit', message.author, args[0]);

      /**
      * Send a message in the channel to let the user know that the operation was successful.
      */
      message.channel.send({
        embed: {
          color: Bastion.colors.GREEN,
          description: `You have given **${args[0]}** Bastion Currencies to <@${user.id}>.`
        }
      }).catch(e => {
        Bastion.log.error(e);
      });

      /**
      * Let the user receiving Bastion Currencies know by DM that their account has been debited.
      */
      user.send({
        embed: {
          color: Bastion.colors.GREEN,
          description: `Your account has been debited with **${args[0]}** Bastion Currencies.`
        }
      }).catch(e => {
        Bastion.log.error(e);
      });

      /**
      * Let the user sending Bastion Currencies know by DM that their account has been credited.
      */
      message.author.send({
        embed: {
          color: Bastion.colors.RED,
          description: `Your account has been credited with **${args[0]}** Bastion Currencies.`
        }
      }).catch(e => {
        Bastion.log.error(e);
      });
    }
    catch (e) {
      Bastion.log.error(e);
    }
  }
};

exports.config = {
  aliases: [],
  enabled: true
};

exports.help = {
  name: 'give',
  botPermission: '',
  userPermission: '',
  usage: 'give <amount> <@user-mention|user_id>',
  example: [ 'give 100 @user#0001', 'give 150 2233445566778899' ]
};
