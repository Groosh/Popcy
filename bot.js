const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
require('./util/eventLoader')(client);
const prefix = ':';
const allowedUsers = ayarlar.allowedUsers;
const roles = ayarlar.roleToDisco;
const disco = new Discord.Client();

/////////////////////DM ATILAN MESAJLAR///////////////////////

client.on("message", message => {
    const dmchannel = client.channels.find("name", "popcy");
    if (message.channel.type === "dm") {
        if (message.author.id === client.user.id) return;
        dmchannel.sendMessage("", {embed: {
                color: 3447003,
                title: `**__Popcy BOT DM Mesajı__: ${message.author.tag}**`,
                description: `**__Dm Mesajı__ => ${message.content}**`
              }})
    }
    if (message.channel.bot) return;
});

/////////////////////DM ATILAN MESAJLAR///////////////////////

///////////////////////BOT HG - BB////////////////////////////

client.on('guildMemberAdd', member => {
  const hg = new Discord.RichEmbed()
  .setAuthor(client.user.username, client.user.avatarURL)
  .setThumbnail(member.user.displayAvatarURL)
  .setDescription(`** ${member.guild.name} Sunucusuna Hoşgeldin ${member.user.username}**`)
  .setFooter(`© Popcy Bot`)
  .setTimestamp()
  .setColor('RANDOM')
  member.send(hg);
});

client.on('guildMemberRemove', member => {
  const bb = new Discord.RichEmbed()
  .setAuthor(client.user.username, client.user.avatarURL)
  .setThumbnail(member.user.displayAvatarURL)
  .setDescription(`** Görüşmek Üzere ${member.user.username} :wave:**`)
  .setFooter(`© Popcy Bot`)
  .setTimestamp()
  .setColor('RANDOM')
  member.send(bb);
});

///////////////////////BOT HG - BB////////////////////////////

//////////////////////////////////////////////////////////////

// reklam yasaklayan
// client.on("message", msg => {
//  if (msg.content.toLowerCase().match(/(http|.com|discord.gg|discordapp.com)/g) && !msg.author.bot && msg.channel.type === "text" && msg.channel.permissionsFor(msg.guild.member(client.user)).has("MANAGE_MESSAGES")) {
//     msg.delete(30).then(deletedMsg => {
//       deletedMsg.reply("Reklam engellendi. :shield:").catch(e => {
//         console.error(e);
//       });
//     }).catch(e => {
//       console.error(e);
//     });
//   }
//});

//////////////////////////////////////////////////////////////

//fs.readdir("./komutlar/", (err, files) => {
//
//  if(err) console.log(err);
//
//  let jsfile = files.filter(f => f.split(".").pop() === "js")
//  if(jsfile.length <= 0){
//    console.log("Komut bulunamadı!");
//    return;
//  }
//
//  jsfile.forEach((f, i) =>{
//    let props = require(`./komutlar/${f}`);
//    console.log(`${f} dosyası başarıyla yüklendi!`);
//    bot.commands.set(props.help.name, props);
//  });
//
//});


/////////////////////////////////////////////////////////////////


const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    }); 
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;

  let command = message.content.split(' ')[0];
  command = command.slice(ayarlar.prefix.length);

  let args = message.content.split(' ').slice(1);

  if(command === "çevir") {
    var translate = require('node-google-translate-skidz');
    let targetLang = args[0];
    if(!targetLang) return message.channel.send(":no_entry_sign: Ne yazacağını söylemelisin. **:çeviri tr hello** gibi.");
    if(targetLang.length > 2) return message.channel.send(":no_entry_sign: Lütfen bir dil gir **tr, en** gibi.");
    var translateText = args.slice(1).join(" ");
    if(!translateText) return message.channel.send(`:no_entry_sign: Çevirmek istediğiniz "${targetLang}" dili yazın..`);

    translate({
      text: translateText,
      target: targetLang
    }, function(result) {
      var translatedText = result.translation
      const embed = new Discord.RichEmbed()
      .setAuthor(`**Çeviri**`, message.author.avatarURL)
      .setColor(0x00AE86)
      .addField("**Mesaj:**", "**" + translateText + "**")
      .addField(`**Çevrilen Mesaj:**   ${targetLang}`, "**" + translatedText + "**")
      .setFooter(`${message.author.tag} tarafından istendi!`, client.user.avatarURL)
      message.channel.send({embed})
        .catch(error => message.channel.send(`Üzgünüm ${message.author.tag} Sana embed şeklinde yollayamıyorum: ${error}`))
    });
  }
})


client.on('message', async message => {
    if (message.content.toLowerCase() === prefix + 'döviz') {
var request = require('request');
request('https://www.doviz.com/api/v1/currencies/USD/latest', function (error, response, body) {
    if (error) return console.log('Hata:', error);
    else if (!error) { 
        var info = JSON.parse(body);
request('https://www.doviz.com/api/v1/currencies/EUR/latest', function (error, response, body) {
    if (error) return console.log('Hata:', error); 
    else if (!error) { 
        var euro = JSON.parse(body);
      message.channel.send(`:dollar: Dolar satış: ${info.selling}   :arrow_right:   :shopping_cart:  Dolar alış: ${info.buying} \n\n:euro: Euro satış: ${euro.selling}  :arrow_right:  \:shopping_cart: Euro alış: ${euro.buying}`)    }
})
    }
})
    }
});

const Jimp = require('jimp');
var f = [];
 
client.on("guildMemberAdd", async member => {
  const channel = member.guild.channels.find('name', 'popcy');//log ismini ayarlıyacaksınız log adında kanal açın
  if (!channel) return;
        let username = member.user.username;
        if (channel === undefined || channel === null) return;
        if (channel.type === "text") {
            const bg = await Jimp.read("https://cdn.discordapp.com/attachments/450693709076365323/473184528148725780/guildAdd.png");
            const userimg = await Jimp.read(member.user.avatarURL);
            var font;
            if (member.user.tag.length < 15) font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
            else if (member.user.tag.length > 15) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            else font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            await bg.print(font, 430, 170, member.user.tag);
            await userimg.resize(362, 362);
            await bg.composite(userimg, 43, 26).write("./img/"+ member.id + ".png");
              setTimeout(function () {
                    channel.send(new Discord.Attachment("./img/" + member.id + ".png"));
              }, 1000);
              setTimeout(function () {
                fs.unlink("./img/" + member.id + ".png");
              }, 10000);
        }
    })
client.on("guildMemberRemove", async member => {
  const channel = member.guild.channels.find('name', 'popcy');//log ismini ayarlıyacaksınız log adında kanal açın
  if (!channel) return;
        let username = member.user.username;
        if (channel === undefined || channel === null) return;
        if (channel.type === "text") {            
                        const bg = await Jimp.read("https://cdn.discordapp.com/attachments/450693709076365323/473184546477572107/guildRemove.png");
            const userimg = await Jimp.read(member.user.avatarURL);
            var font;
            if (member.user.tag.length < 15) font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
            else if (member.user.tag.length > 15) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            else font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            await bg.print(font, 430, 170, member.user.tag);
            await userimg.resize(362, 362);
            await bg.composite(userimg, 43, 26).write("./img/"+ member.id + ".png");
              setTimeout(function () {
                    channel.send(new Discord.Attachment("./img/" + member.id + ".png"));
              }, 1000);
              setTimeout(function () {
                fs.unlink("./img/" + member.id + ".png");
              }, 10000);
        }
    })

client.on('guildCreate', guild => {
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Sunucuya katıldı;')
  .setDescription(`Bot, »${guild.name}« adlı sunucuya katıldı [${guild.memberCount} üye]!`)
  .setFooter('Popcy', client.user.avatarURL)
  .setTimestamp()
  client.channels.get('464162941814702095').send(embed);
});

client.on('guildDelete', guild => {
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Sunucudan ayrıldı;')
  .setDescription(`Bot, »${guild.name}« adlı sunucudan ayrıldı [${guild.memberCount} üye]!`)
  .setFooter('Popcy', client.user.avatarURL)
  .setTimestamp()
  client.channels.get('464162941814702095').send(embed);
});

client.on('roleCreate', role => {
  const channel = role.guild.channels.find('name', 'popcy');
  if (!channel) return role.guild.createChannel('popcy');
  if (!channel) return;
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Rol oluşturuldu;')
  .setDescription(`"<@&${role.id}>" adlı rol oluşturuldu!`)
  .setFooter('Popcy', client.user.avatarURL)
  .setTimestamp()
  channel.send(embed);
});

client.on('roleDelete', role => {
  const channel = role.guild.channels.find('name', 'popcy');
  if (!channel) return role.guild.createChannel('popcy');
  if (!channel) return;
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Rol silindi;')
  .setDescription(`"${role.name}" adlı rol silindi!`)
  .setFooter('Popcy', client.user.avatarURL)
  .setTimestamp()
  channel.send(embed);
});

client.on('channelDelete', chnnl => {
  const channel = chnnl.guild.channels.find('name', 'popcy');
  if (!channel) return;
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Kanal silindi;')
  .setDescription(`"${chnnl.name}" adlı kanal silindi!`)
  .setFooter('Popcy', client.user.avatarURL)
  .setTimestamp()
  channel.send(embed);
});


const GIFEncoder = require('gifencoder');

client.on("message", async message => {
  var user = message.mentions.users.first() || message.author;
    if (message.content.toLowerCase() === prefix + "trigger") {
        const options = {
            size: 256,
          
            frames: 16
        }

        message.channel.send("İşleniyor.. Lütfen bekleyiniz. ?").then(m => m.delete(1000));

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        const args = message.content.split(' ').slice(1);
        let member = message.mentions.users.first()
        if (args[0] === undefined) member = message.author;
        let avatarurl = member.avatarURL;
        if (['jpg', 'jpeg', 'gif', 'png', 'webp'].some(x => args.join(' ').includes(x))) {
            avatarurl = args.join(' ').replace(/gif|webp/g, 'png');
        }
        const base = new Jimp(options.size, options.size);
        const avatar = await Jimp.read(avatarurl);
        const text = await Jimp.read('https://cdn.glitch.com/a7d3b6b8-9b7a-4aab-9ee4-1db0c07ef1eb%2Ftriggered.png?1526842782410');
        const tint = await Jimp.read('https://cdn.glitch.com/5fed2789-b430-43c5-bf1b-a8dd32d46b97%2Fred.png?1527082445373');
        avatar.resize(320, 320);
        tint.scaleToFit(base.bitmap.width, base.bitmap.height);
        tint.opacity(0.2);
        text.scaleToFit(280, 60);
        const frames = [];
        const buffers = [];
        const encoder = new GIFEncoder(options.size, options.size);
        const stream = encoder.createReadStream();
        let temp;
       stream.on('data', async buffer => await buffers.push(buffer));
        stream.on('end', async () => {
            return await message.channel.send({
                files: [{
                    name: 'notechtriggered.gif',
                    attachment: Buffer.concat(buffers)
                }]
            });
        });
        for (let i = 0; i < options.frames; i++) {
            temp = base.clone();
            if (i === 0) {
                temp.composite(avatar, -16, -16);
            } else {
                temp.composite(avatar, -32 + getRandomInt(-16, 16), -32 + getRandomInt(-16, 16));
            }
            temp.composite(tint, 0, 0);
            if (i === 0) temp.composite(text, -10, 200);
            else temp.composite(text, -12 + getRandomInt(-8, 8), 200 + getRandomInt(-0, 12));
            frames.push(temp.bitmap.data);
        }
        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(20);
        for (const frame of frames) {
            encoder.addFrame(frame);
        }
        encoder.finish();
    }
});

client.on("message", async message => {
  var user = message.mentions.users.first() || message.author;
    if (message.content.toLowerCase() === prefix + "wasted") {
      message.channel.startTyping();
        var user = message.mentions.users.first() || message.author;
        if (!message.guild) user = message.author;
      
      message.channel.send("İşleniyor.. Lütfen bekleyiniz. ?").then(m => m.delete(1000));

        Jimp.read(user.avatarURL, (err, image) => {
            image.resize(295, 295)
            image.greyscale()
            image.gaussian(3)
            Jimp.read("https://cdn.glitch.com/b18a2fa6-68cb-49d5-9818-64c50dd0fdab%2F1.png?1529363616039", (err, avatar) => {
                avatar.resize(295, 295)
                image.composite(avatar, 4, 0).write(`./img/wasted/${client.user.id}-${user.id}.png`);
                setTimeout(function() {
                    message.channel.send(new Discord.Attachment(`./img/wasted/${client.user.id}-${user.id}.png`));
                }, 1000);
          message.channel.stopTyping();
            });
        });
    }
});

client.on("message", async message => {
  var user = message.mentions.users.first() || message.author;
    if (message.content.toLowerCase() === prefix + "sniper") {
        var user = message.mentions.users.first() || message.author;
        if (!message.guild) user = message.author;

        message.channel.send("İşleniyor.. Lütfen bekleyiniz. ?").then(m => m.delete(1000));

        Jimp.read(user.avatarURL, (err, image) => {
            image.resize(310, 325)
            image.greyscale()
            image.gaussian(3)
            Jimp.read("https://cdn.glitch.com/b18a2fa6-68cb-49d5-9818-64c50dd0fdab%2FPNGPIX-COM-Crosshair-PNG-Transparent-Image.png?1529363625811", (err, avatar) => {
                avatar.resize(310, 325)
                image.composite(avatar, 2, 0).write(`./img/snip/${client.user.id}-${user.id}.png`);
                setTimeout(function() {
                    message.channel.send(new Discord.Attachment(`./img/snip/${client.user.id}-${user.id}.png`));
                }, 1000);
            });

        });
    }
});

const table = require('table');
const arraySort = require('array-sort');

client.on("message", async message => {
  var user = message.mentions.users.first() || message.author;
    if (message.content.toLowerCase() === prefix + "davetler") {
        let invites = await message.guild.fetchInvites().catch(error => {
            return message.channel.send(`Davetleri görüntülemek için yetkim bulunmuyor.`);
        })
        invites = invites.array();
        arraySort(invites, 'uses', {
            reverse: true
        }); 
        let possibleInvites = [
            ['Kullanıcı', 'Kullanım']
        ]; 
        invites.forEach(function(invite) {
            possibleInvites.push([invite.inviter.username, invite.uses]);
        })
        const embed = new Discord.RichEmbed()
            .setColor("RANDOM")
            .addField('Davet sıralaması:', `\`\`\`${table.table(possibleInvites)}\`\`\``);
        message.channel.send(embed)
    }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'sa') {
    setTimeout(() => {
	msg.react('??');
	},500);
	setTimeout(() => {
	msg.react('??');
	},1000);
  };

  if (msg.author.bot) return;
  if (msg.content.toLowerCase().includes('Semih')) msg.reply('**Semih seni çağırıyorlar. @338935436665815051**');
  if (msg.content.toLowerCase().includes('iyi akşamlar')) msg.reply('**İyi akşamlar**');
  if (msg.content.toLowerCase().includes('güle güle')) msg.reply('**GÜLE GÜLE CİĞERİM**');
});

client.on('message', msg => {
if (msg.content.toLowerCase() === 'sigaraajldjas') {
msg.channel.send(':smoking: :cloud::cloud::cloud:')
.then(nmsg => nmsg.edit(':smoking: :cloud::cloud:'))
.then(nmsg => nmsg.edit(':smoking: :cloud:'))
.then(nmsg => nmsg.edit(':smoking: :cloud::cloud:'))
.then(nmsg => nmsg.edit(':smoking: :cloud:'))
.then(nmsg => nmsg.edit('**Sigaram bitti** | **Sigara bitti baba**'));
}
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'Selamun aleyküm') {
   msg.channel.sendMessage('Aleyküm selam.');
}
});



client.on('message', message => {
  if (message.author.bot) return;
  if (message.channel.type !== 'text') return;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  let command = message.content.split(' ')[0];
  command = command.slice(prefix.length);
  let args = message.content.split(' ').slice(1);
  let cont = message.content.slice(prefix.length).split(' ');
  let args2 = cont.slice(1);

  if (command === 'like') {
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle("Like;")
    .addField("==?==?==?==?===?==?==?==?==?==?==?==?\n------------------------- \n-------------------------- ")
	.addField("-------------------------- \n-------------------------- \n-------------------------- ")
	.addField("---------------------------------\n---------------------------------\n---------------------------------")
	.addField("---------------------------------\n---------------------------------\n---------------------------------")
	.addField("-------------------------------- \n------------------------------- ")
	.addField("?O?O?O?O?O?O?O?O?O?O?O?O? \n---------------------------------\n---------------------------------")
	.addField("---------------------------------")
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'resim-değiştir') {
    if(message.author.id !== '338935436665815051') 
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Resim değiştir;').setDescription(message.author.tag + ', bu komutu yalnızca yapımcım kullanabilir.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Resim değiştir;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Resim değiştir;').setDescription(message.author.tag + ', kullanım: tr!resim-değiştir <bağlantı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    client.user.setAvatar(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Resim değiştir;')
    .setDescription(message.author.tag + ', profil resmim başarıyla değiştirildi.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  if (command === 'çeviri') {
    var translate = require('node-google-translate-skidz');
    let targetLang = args[0];
    if(!targetLang) return message.channel.send(":no_entry_sign: Ne yazacağını demelisin **:çeviri tr hello** gibi.");
    if(targetLang.length > 2) return message.channel.send(":no_entry_sign: Lütfen bir dil gir **tr, en** gibi.");
    var translateText = args.slice(1).join(" ");
    if(!translateText) return message.channel.send(`:no_entry_sign: Çevirmek istediğiniz "${targetLang}" dili yazın..`);

    translate({
      text: translateText,
      target: targetLang
    }, function(result) {
      var translatedText = result.translation
      const embed = new Discord.RichEmbed()
      .setAuthor(`Çeviri`, message.author.avatarURL)
      .setColor(0x00AE86)
      .addField("Mesaj:", "**" + translateText + "**")
      .addField(`Çevrilen Mesaj: ${targetLang}`, "**" + translatedText + "**")
      .setFooter(`${message.author.tag} tarafından istendi!`, client.user.avatarURL)
      message.channel.send({embed})
        .catch(error => message.channel.send(`Üzgünüm ${message.author.tag} Sana embed şeklinde yollayamıyorum: ${error}`))
    });
  }
  if (command === 'durum-değiştir') {
    if(message.author.id !== '431150610851823617') 
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Durum değiştir;').setDescription(message.author.tag + ', bu komutu yalnızca yapımcım kullanabilir.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Durum değiştir;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Durum değiştir;').setDescription(message.author.tag + ', kullanım: tr!durum-değiştir <durum>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    client.user.setStatus(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Durum değiştir;')
    .setDescription(message.author.tag + ', durumum başarıyla değiştirildi.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'aktivite-değiştir') {
    if(message.author.id !== '338935436665815051') 
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Aktivite değiştir;').setDescription(message.author.tag + ', bu komutu yalnızca yapımcım kullanabilir.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Aktivite deği??tir;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Aktivite değiştir;').setDescription(message.author.tag + ', kullanım: tr!aktivite-değiştir <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    client.user.setActivity(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Aktivite değiştir;')
    .setDescription(message.author.tag + ', aktivitem başarıyla değiştirildi.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'bağlantılar' || command === 'linkler') {
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Bağlantılar;')
    .addField('Facebook:', 'https://www.facebook.com/Popcy', true)
    .addField('YouTube:', 'https://www.youtube.com/channel/Yok.', true)
    .addField('Twitter:', 'https://twitter.com/Popcy`in-Twitteri-Yotkur', true)
    .addField('İnstagram:', 'https://www.instagram.com/Receb_Aydemir', true)
    .addField('Twitch:', 'https://www.twitch.tv/YheRenk', true)
    .addField('Steam:', 'http://steamcommunity.com/profiles/Yok', true)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'yapımcı') {
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Yapımcı;')
    .setDescription('<@338935436665815051>')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'istatistik' || command === 'i') {
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('İstatistik;')
    .addField('Gecikme:', client.ping + ' ms', true)
    .addField('Kullanıcılar:', client.guilds.reduce((a, b) => a + b.memberCount, 0), true)
    .addField('Kanallar:', client.channels.size, true)
    .addField('Sunucular:', client.guilds.size, true)
    .addField('Bellek kullanımı:', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), true)
    .addField('Discord.JS sürümü:', Discord.version, true)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command ===`öp`) {
    let kiss = [
      "https://media1.tenor.com/images/395b565d26a74bcf6b6fc8cea50df021/tenor.gif",
      "http://cdn.smosh.com/wp-content/uploads/ftpuploads/bloguploads/awkward-kiss-little-girl.gif",
      "https://thumbs.gfycat.com/BasicPeskyGuillemot-max-1mb.gif",
      "https://i.pinimg.com/originals/fe/64/e9/fe64e9e2f16ced383c0cb69e5f71722d.gif",
      "http://25.media.tumblr.com/e7f39c316f0923710c9b12e9583455ba/tumblr_mj7yrrtFaa1s7cfr2o1_500.gif",
      "https://media2.giphy.com/media/TkDX9bkIROf8k/giphy.gif",
      "http://gifimage.net/wp-content/uploads/2017/09/anime-gif-kiss-11.gif",
      "https://i.imgur.com/eisk88U.gif",
      "https://i.pinimg.com/originals/42/c3/85/42c3851fc31dc3434dfe5fa7e3463f1d.gif",
      "https://i.makeagif.com/media/7-05-2015/553Vsb.gif",
      "https://i.gifer.com/2II9.gif",
      "http:/http://gif-finder.com/wp-content/uploads/2015/09/Angry-Birds-Orange-Kiss.gif/a.fod4.com/images/GifGuide/michael_scott/119477_o.gif",
      "http://gif-finder.com/wp-content/uploads/2015/09/Angry-Birds-Orange-Kiss.gif",
      "https://media1.tenor.com/images/6af13a438013667a81031dde8d6b6931/tenor.gif",
      "https://media1.tenor.com/images/a3e63e98f0344a2e9a040ea5df3769b0/tenor.gif",
      "https://media1.tenor.com/images/fb92d0be78a1ea19af0168c0ca29c1bd/tenor.gif?itemid=5615952",
      
    ]
    let hugresult = Math.floor((Math.random() * kiss.length));
    if (!args[0]) {
        const ghembed = new Discord.RichEmbed()
            .setColor(`RANDOM`)
            .setTitle(`${message.author.username} Kendini öptü İğrençsin.`)
            .setImage('https://cdn.discordapp.com/attachments/452115003659780096/460369555823525898/kiss.gif')
        message.channel.send({
            embed: ghembed
        })
        return;
    }
    if (!message.mentions.members.first().user.username === message.isMentioned(message.author)) {
        const hembed = new Discord.RichEmbed()
            .setColor(`RANDOM`)
            .setTitle(`${message.author.username} , ${message.mentions.members.first().user.username} Öptü!`)
            .setImage(kiss[hugresult])
        message.channel.send({
            embed: hembed
        })
        return;
    }
    const ghembed = new Discord.RichEmbed()
        .setColor(`RANDOM`)
        .setTitle(`${message.author.username} Kendini öptü İğrençsin.`)
        .setImage('https://cdn.discordapp.com/attachments/452115003659780096/460369555823525898/kiss.gif')
    message.channel.send({
        embed: ghembed
    })
}  

  
  if (command === 'sunucular' || command === 'bot-sunucu') {
    const guildArray = client.guilds.array()
    while (guildArray.length) {
    const embed = new Discord.RichEmbed();
    const guilds = guildArray.splice(0,25);
    for (const guild of guilds) {
      embed.setColor('RANDOM')
      embed.setTitle('Sunucular;')
      embed.setDescription(`Şu an ${client.guilds.size} sunucuda bulunuyorum.`)
      embed.addField(guild.name, guild.memberCount + ' üye.', true)
      embed.setFooter('Popcy', client.user.avatarURL)
      embed.setTimestamp()
    }
    message.channel.send({embed: embed});
    
        };
  }
//  if (command === 'profil' || command === 'profile') {
//    if (!message.guild) {
//      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
//    let user = message.mentions.users.first();
//    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Profil;').setDescription(message.author.tag + ', kullanım: tr!profil <@kullanıcı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
//    sql.get(`SELECT * FROM scores WHERE userId ="${user.id}"`).then(row => {
//      if (!row) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Profil;').setDescription(message.author.tag + ', hiç puanı yok.').setFooter('Popcy', client.user.avatarURL));
//
//    const embed = new Discord.RichEmbed()
//    .setColor('RANDOM')
//    .setAuthor(user.tag, user.avatarURL || user.defaultAvatarURL)
//    .setThumbnail(user.avatarURL || user.defaultAvatarURL)
//    .setTitle('Profil;')
//    .addField('Puan:', row.points, true)
//    .addField('Seviye:', row.level, true)
 //   .setFooter('Popcy', client.user.avatarURL)
 //   .setTimestamp()
 //   message.channel.send(embed);
 //    })
 //  })
 //       };
  
  if (command === 'yapımcı-para') {
    if(message.author.id !== '431150610851823617') 
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yapımcı para;').setDescription(message.author.tag + ', bu komutu yalnızca yapımcım kullanabilir.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
      if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
      if(message.author.id === '431150610851823617') {
    } else {
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Yapımcı para;')
    .setDescription(message.author.tag + ', bu komutu yalnızca yapımcım kullanabilir.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
   }
  }
  if (command === 'maden') {
    let sayılar = Math.floor(Math.random() * 50)
    message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazma işi başladı!').setFooter('Popcy', client.user.avatarURL).setTimestamp())
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazılıyor %25.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazılıyor %50.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazılıyor %75.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazılıyor %100.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazma işi bitti!').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', madenden ' + sayılar + ' ? kazandın!').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
        };
  
  if (command === 'kullanıcı' || command === 'kullanıcı-bilgi') {
    let user = message.mentions.users.first();
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setAuthor(message.author.tag, message.author.avatarURL || message.author.defaultAvatarURL).setThumbnail(message.author.avatarURL || message.author.defaultAvatarURL).setTitle('Kullanıcı;').addField('Oyun:', message.author.presence.game ? message.author.presence.game.name : 'Oyun oynamıyor', true).addField('Kimlik:', message.author.id, true).addField('Bot:', message.author.bot ? '\n Evet' : 'Hayır', true).addField('Rolleri:', message.guild.member(message.author).roles.map(m => m.name).join(' | '), true).addField('Son gönderdiği mesaj:', message.author.lastMessage || 'Yok', true).addField('Son gönderdiği mesajın kimliği:',message.author.lastMessageID || 'Yok', true).addField('Oluşturma tarihi:', message.author.createdAt.toLocaleDateString(), true).setFooter('Popcy', client.user.avatarURL).setTimestamp());
      const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setAuthor(user.tag, user.avatarURL || user.defaultAvatarURL)
      .setThumbnail(user.avatarURL || user.defaultAvatarURL)
      .setTitle('Kullanıcı;')
      .addField('Oyun:', user.presence.game ? user.presence.game.name : 'Oyun oynamıyor', true)
      .addField('Kimlik:', user.id, true)
      .addField('Bot:', user.bot ? '\n Evet' : 'Hayır', true)
      .addField('Rolleri:', message.guild.member(user).roles.map(m => m.name).join(' | '), true)
      .addField('Son gönderdiği mesaj:', user.lastMessage || 'Yok', true)
      .addField('Son gönderdiği mesajın kimliği:', user.lastMessageID || 'Yok', true)
      .addField('Oluşturma tarihi:', user.createdAt.toLocaleDateString(), true)
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
      message.channel.send(embed);
        };
  
  if (command === 'profil-resmi' || command === 'pp' || command === 'avatar') {
    let user = message.mentions.users.first();
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Profil resmi;').setImage(message.author.avatarURL || message.author.defaultAvatarURL).setFooter('Popcy', client.user.avatarURL).setTimestamp());
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Profil resmi;')
    .setImage(user.avatarURL || user.defaultAvatarURL)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  

  if (command === 'sunucubilgi' || command === 'sunucubilgi') {
    const emojiList = message.guild.emojis.map(e=>e.toString()).join(' ');
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setAuthor(message.guild.name, message.guild.iconURL)
    .setThumbnail(message.guild.iconURL)
    .setTitle('Sunucu;')
    .addField('İsim kısaltması:', message.guild.nameAcronym, true)
    .addField('Kimliği:', message.guild.id, true)
    .addField('Bölgesi:', message.guild.region, true)
    .addField('Sahibi:', message.guild.owner, true)
    .addField('Doğrulama seviyesi:', message.guild.verificationLevel, true)
    .addField('Emojiler:', emojiList || 'Yok', true)
    .addField('Üyeler:', `${message.guild.members.filter(member => member.user.bot).size} bot / ${message.guild.memberCount} üye`, true)
    .addField('Varsayılan rol:', message.guild.defaultRole, true)
    .addField('Roller:', message.guild.roles.map(role => role.name).join(' | '), true)
    .addField('Kanallar:', `${message.guild.channels.filter(chan => chan.type === 'voice').size} sesli / ${message.guild.channels.filter(chan => chan.type === 'text').size} metin`, true)
    .addField('Kanal sayısı:', message.guild.channels.size, true)
    .addField('Ana kanalı:', message.guild.defaultChannel || 'Yok', true)
    .addField('Sistem kanalı:', message.guild.generalChannel || 'Yok', true)
    .addField('AFK kanalı:', message.guild.afkChannel || 'Yok', true)
    .addField('AFK zaman aşımı:', message.guild.afkTimeout + ' saniye', true)
    .addField('Oluşturma tarihi:', message.guild.createdAt.toLocaleDateString(), true)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'att' || command === 'kickk') {
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('At;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    let guild = message.guild
    let reason = args.slice(1).join(' ');
    let user = message.mentions.users.first();
    let modlog = guild.channels.find('name', 'Popcy');
    if (!modlog) return message.guild.createChannel('Popcy');
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('At;').setDescription(message.author.tag + ', kullanım: tr!at <@kullanıcı> <sebep>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (reason.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('At;').setDescription(message.author.tag + ', kullanım: tr!at <@kullanıcı> sebep>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());

    if (!message.guild.member(user).kickable) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('At;').setDescription(message.author.tag + ', yetkilileri atamam.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    message.guild.member(user).kick();

    const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Sunucudan atıldın;')
      .setDescription(message.guild.name + ' adlı sunucudan atıldın.')
      .addField('Yetkili:', message.author.tag, true)
      .addField('Sebep:', reason, true)
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
    user.send(embed);
    const embed2 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('At;')
      .setDescription(user.tag + ' adlı kullanıcı başarıyla atıldı.')
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
    message.channel.send(embed2);
    const embed3 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('At;')
      .addField('Kullanıcı:', user.tag, true)
      .addField('Yetkili:', message.author.tag, true)
      .addField('Sebep:', reason, true)
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
    return guild.channels.get(modlog.id).send(embed3);
        };

  if (command === 'yasaklaa' || command === 'bann') {
    if (!message.member.permissions.has('BAN_MEMBERS')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    let guild = message.guild
    let reason = args.slice(1).join(' ');
    let user = message.mentions.users.first();
    let modlog = guild.channels.find('name', 'Popcy');
    if (!modlog) return message.guild.createChannel('Popcy');
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', kullanım: tr!yasakla <@kullanıcı> <sebep>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (reason.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', kullanım: tr!yasakla <@kullanıcı> <sebep>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());

    if (!message.guild.member(user).bannable) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', yetkilileri yasaklayamam.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    message.guild.ban(user, 2);

    const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Sunucudan yasaklandın;')
      .setDescription(message.guild.name + ' adlı sunucudan yasaklandın.')
      .addField('Yetkili:', `${message.author.tag}`, true)
      .addField('Sebep:', reason, true)
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
    user.send(embed);
    const embed2 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Yasakla;')
      .setDescription(user.tag + ' adlı kullanıcı başarıyla yasaklandı.')
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
    message.channel.send(embed2);
    const embed3 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Yasakla;')
      .addField('Kullanıcı:', `${user.tag}`, true)
      .addField('Yetkili:', `${message.author.tag}`, true)
      .addField('Sebep:', reason, true)
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
    return guild.channels.get(modlog.id).send(embed3);
        };

  if (command === 'uyar') {
    if (!message.member.permissions.has('KICK_MEMBERS')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Uyar;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Uyar;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
      let guild = message.guild
      let reason = args.slice(1).join(' ');
      let user = message.mentions.users.first();
      let modlog = guild.channels.find('name', 'Popcy');
      if (!modlog) return message.guild.createChannel('Popcy');
      if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Uyar;').setDescription(message.author.tag + ', kullanım: tr!uyar <@kullanıcı> <sebep>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
      if (reason.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Uyar;').setDescription(message.author.tag + ', kullanım: tr!uyar <@kullanıcı> <sebep>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());

      const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle('Sunucuda uyarıldın;')
        .setDescription(message.guild.name + ' adlı sunucuda uyarıldın.')
        .addField('Yetkili:', message.author.tag, true)
        .addField('Sebep:', reason, true)
        .setFooter('Popcy', client.user.avatarURL)
        .setTimestamp()
      user.send(embed);
      const embed2 = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle('Uyar;')
        .setDescription(user.tag + ' adlı kullanıcı başarıyla uyarıldı.')
        .setFooter('Popcy', client.user.avatarURL)
        .setTimestamp()
      message.channel.send(embed2);
      const embed3 = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle('Uyar;')
        .addField('Kullanıcı:', user.tag, true)
        .addField('Yetkili:', message.author.tag, true)
        .addField('Sebep:', reason, true)
        .setFooter('Popcy', client.user.avatarURL)
        .setTimestamp()
      return guild.channels.get(modlog.id).send(embed3)
        };
  
  if (command === 'sil') {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sil;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sil;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    let guild = message.guild
    let modlog = guild.channels.find('name', 'Popcy');
    if (!modlog) return message.guild.createChannel('Popcy');
    let mesajsayisi = parseInt(args.join(' '));
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sil;').setDescription(message.author.tag + ', kullanım: tr!sil <sayı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (mesajsayisi > 100) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sil;').setDescription(message.author.tag + ', 100 adetden fazla mesaj silemem.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    message.channel.bulkDelete(mesajsayisi + 1);
    const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Sil;')
      .setDescription(message.author.tag + ', mesajları başarıyla sildim.')
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
    message.channel.send(embed);
    const embed2 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Sil;')
      .addField('Yetkili:', message.author.tag, true)
      .addField('Kanal:', message.channel.name, true)
      .addField('Mesaj sayısı:', mesajsayisi, true)
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
    return guild.channels.get(modlog.id).send(embed2)
    message.delete()
        };
  
  if (command === 'sunucu-adı-değiştir') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu adı değiştir;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu adı değiştir;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu adı değiştir;').setDescription(message.author.tag + ', kullanım: tr!sunucu-adı-değiştir <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    message.guild.setName(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Sunucu adı değiştir;')
    .setDescription(message.author.tag + ', sunucu adı başarıyla değiştirildi.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'sunucu-resmi-değiştir') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu resmi değiştir;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu resmi değiştir;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu resmi değiştir;').setDescription(message.author.tag + ', kullanım: tr!sunucu-resmi-değiştir <bağlantı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    message.guild.setIcon(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Sunucu resmi değiştir;')
    .setDescription(message.author.tag + ', sunucu resmi başarıyla değiştirildi.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'kanal-aç') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kanal aç;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kanal aç;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kanal aç;').setDescription(message.author.tag + ', kullanım: tr!kanal-aç <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    const channel = message.guild.createChannel(mesaj);
        };

  if (command === 'rol-oluştur') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Rol oluştur;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Rol oluştur;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Rol oluştur;').setDescription(message.author.tag + ', kullanım: tr!rol-oluştur <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    message.guild.createRole({
                    name: sayMessage,
                    color: "#FF4000",
                    permission:[]
            });
    const embed = new Discord.RichEmbed()
     .setColor('RANDOM')
     .setTitle('Rol oluştur;')
     .setDescription(`Başarıyla rol oluşturdum!`)
     .setFooter('Popcy', client.user.avatarURL)
     .setTimestamp()
     message.channel.send(embed);
  }
  if(command === 'mc-sunucu') {
    const IPhere = args.join(' ');
    if (IPhere.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Minecraft sunucu;').setDescription(message.author.tag + ', kullanım: tr!mc-sunucu <sunucu IP>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    var request = require('request');
      request('https://api.mcsrvstat.us/1/' + IPhere, function (error, response, body) {
      if(error) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Minecraft sunucu;').setDescription(message.author.tag + ', bir şeyler ters gitti.').setFooter('Popcy', client.user.avatarURL).setTimestamp());

      var bodyJSON = JSON.parse(body)
      if(bodyJSON.debug.ping !== true) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Minecraft sunucu;').setDescription(message.author.tag + ', bu sunucu kapalı.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
      var serverIP = bodyJSON.ip
      var serverPort = bodyJSON.port
      var motd1 = bodyJSON.motd.clean[0]
      var motd2 = bodyJSON.motd.clean[1]
      if(!motd2){ 
        var motd2 = "No second line.";
      }
      var version = bodyJSON.version
      var onlinePlayers = bodyJSON.players.online
      var maxPlayers = bodyJSON.players.max
      const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle(motd1)
        .addField('Sunucu IP:', `${serverIP}:${serverPort}`, true)
        .addField('Sürüm:', version, true)
        .addField('Açıklama:', `${motd1}\n${motd2}`)
        .addField('Oyuncular (çevrimiçi/toplam):', `${onlinePlayers}/${maxPlayers}`, true)
        .setFooter('Minecraft sunucu', client.user.avatarURL)
        .setTimestamp()
        message.channel.send({embed})
        .catch(error => message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Minecraft sunucu;').setDescription(message.author.tag + ', bir şeyler ters gitti.').setFooter('Popcy', client.user.avatarURL).setTimestamp()));
    });
  }
  
  if (command === 'kısalt') {
    if (!args[0]) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kısalt;').setDescription(message.author.tag + ', kullanım: tr!kısalt <bağlantı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
      if (!args[1]) {
        shorten.shorten(args[0], function(res) {
          message.channel.send(res);
        })
      } else {
        shorten.custom(args[0], args[1], function(res) {
          if (res.startsWith('Error')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kısalt;').setDescription(res).setFooter('Popcy', client.user.avatarURL).setTimestamp());
          message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kısalt;').setDescription(`<${res}>`).setFooter('Popcy', client.user.avatarURL).setTimestamp());
        })
      }
  }
  if (command === 'müzik-ara') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Müzik ara;').setDescription(message.author.tag + ', kullanım: tr!müzik-ara <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    genius.search(args.join(' '))
    .then(function(results) {
    return results[0]
      })
      .then(function(result) {
      const embed = new Discord.RichEmbed()
                .setColor('RANDOM')
                .setTitle('Müzik ara;')
                .addField('Müzik adı:', result.title, true)
                .addField('Sanatçı:', result.artist, true)
                .addField('Sözler:', '[Genius]('+result.url+')', true)
                .setFooter('Popcy', client.user.avatarURL)
                .setTimestamp()
                message.channel.send(embed);
        });
  }
  if (command === 'youtube') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('YouTube;').setDescription(message.author.tag + ', kullanım: tr!youtube <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
   message.channel.send('', {
    embed: {
      type: 'rich',
      title: 'YouTube',
      description: '[' + args.toString().replace(/,/g, ' ') + '](https://www.youtube.com/results?search_query=' + args.toString().replace(/,/g, '+') + ')',
      color: 0xff4000
    }
        });
  }
  if (command === 'twitter') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Twitter;').setDescription(message.author.tag + ', kullanım: tr!twitter <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
   message.channel.send('', {
    embed: {
      type: 'rich',
      title: 'Twitter',
      description: '[' + args.toString().replace(/,/g, ' ') + '](https://twitter.com/search?q=' + args.toString().replace(/,/g, '%20') + ')',
      color: 0xff4000
    }
   })
        };
  
  if (command === 'google') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Twitter;').setDescription(message.author.tag + ', kullanım: tr!twitter <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
   message.channel.send('', {
    embed: {
      type: 'rich',
      title: 'Google',
      description: '[' + args.toString().replace(/,/g, ' ') + '](https://google.com/search?q=' + args.toString().replace(/,/g, '%20') + ')',
      color: 0xff4000
    }
   })
        };
  
  if (command === 'instagram') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Twitter;').setDescription(message.author.tag + ', kullanım: tr!twitter <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
   message.channel.send('', {
    embed: {
      type: 'rich',
      title: 'İnstagram',
      description: '[' + args.toString().replace(/,/g, ' ') + '](https://instagram.com/' + args.toString().replace(/,/g, '%20') + ')',
      color: 0xff4000
    }
   })
        };
  
  if (command === 'github') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('GitHub;').setDescription(message.author.tag + ', kullanım: tr!github <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
   message.channel.send('', {
    embed: {
      type: 'rich',
      title: 'GitHub',
      description: '[' + args.toString().replace(/,/g, ' ') + '](https://github.com/search?q=' + args.toString().replace(/,/g, '+') + ')',
      color: 0xff4000
    }
   })
        };
  
  if (command === 'discord-bots') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Twitter;').setDescription(message.author.tag + ', kullanım: tr!twitter <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
   message.channel.send('', {
    embed: {
      type: 'rich',
      title: 'Discord Bots',
      description: '[' + args.toString().replace(/,/g, ' ') + '](https://discordbots.org/search?q=' + args.toString().replace(/,/g, '%20') + ')',
      color: 0xff4000
    }
   })
        };
  
    if (command === 'facebook') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Twitter;').setDescription(message.author.tag + ', kullanım: tr!twitter <mesaj>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
   message.channel.send('', {
    embed: {
      type: 'rich',
      title: 'Facebook',
      description: '[' + args.toString().replace(/,/g, ' ') + '](https://facebook.com/search/top/?q=' + args.toString().replace(/,/g, '%20') + ')',
      color: 0xff4000
    }
   })
        };
  

  if (command === '1v1') {
    if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    let user = message.mentions.users.first();
    if (message.mentions.users.size < 2) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('2v2;').setDescription(message.author.tag + ', kullanım: tr!2v2 <@kullanıcı> <@kullanıcı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
      message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('2v2;').setDescription('Savaş başladı!').setFooter('Popcy', client.user.avatarURL).setTimestamp())
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('2v2;').setDescription('Savaşılıyor %25.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('2v2;').setDescription('Savaşılıyor %50.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('2v2;').setDescription('Savaşılıyor %75.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('2v2;').setDescription('Savaşılıyor %100.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('2v2;').setDescription('Savaş bitti!').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('2v2;').setDescription('Kazanan: ' + user.tag).setFooter('Popcy', client.user.avatarURL).setTimestamp()));
        };
  
  if (command === '2v2') {
    if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    let user = message.mentions.users.first();
    if (message.mentions.users.size < 3) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('3v3;').setDescription(message.author.tag + ', kullanım: tr!3v3 <@kullanıcı> <@kullanıcı> <@kullanıcı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
      message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('3v3;').setDescription('Savaş başladı!').setFooter('Popcy', client.user.avatarURL).setTimestamp())
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('3v3;').setDescription('Savaşılıyor %25.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('3v3;').setDescription('Savaşılıyor %50.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('3v3;').setDescription('Savaşılıyor %75.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('3v3;').setDescription('Savaşılıyor %100.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('3v3;').setDescription('Savaş bitti!').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('3v3;').setDescription('Kazanan: ' + user.tag).setFooter('Popcy', client.user.avatarURL).setTimestamp()))
        };
  
  if (command === '4v4') {
    if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    let user = message.mentions.users.first();
    if (message.mentions.users.size < 4) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('4v4;').setDescription(message.author.tag + ', kullanım: tr!4v4 <@kullanıcı> <@kullanıcı> <@kulanıcı> <@kullanıcı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
      message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('4v4;').setDescription('Savaş başladı!').setFooter('Popcy', client.user.avatarURL).setTimestamp())
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('4v4;').setDescription('Savaşılıyor %25.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('4v4;').setDescription('Savaşılıyor %50.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('4v4;').setDescription('Savaşılıyor %75.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('4v4;').setDescription('Savaşılıyor %100.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('4v4;').setDescription('Savaş bitti!').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('4v4;').setDescription('Kazanan: ' + user.tag).setFooter('Popcy', client.user.avatarURL).setTimestamp()))
        };
  
  if (command === 'sunucu-davet') {
    if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    message.guild.channels.get(message.channel.id).createInvite().then(invite =>
    message.channel.send('Bu sunucunun davet bağlantısı;\n' + invite.url)
   );
        };

  if (command === 'reklam-kontrol') {
    if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const members = message.guild.members.filter(member => member.user.presence.game && /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(member.user.presence.game.name))
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Reklam kontrol;').setDescription(members.map(member => member.displayName + ' adlı kullanıcının aktivite kısmında sunucu bağlantısı var.').join('\n') || message.author.username + ', kimse aktivite kısmına sunucu bağlantısı koymamış.').setFooter('Popcy', client.user.avatarURL).setTimestamp());

        };

  
  if (command === 'oyun-öneri') {
    var cumleler= ['Grand Theft Auto', 'Minecraft', 'ROBLOX', 'Unturned', 'Creativerse', 'Prototype', 'Call of Duty', 'Zula', 'PLAYERUNKNOWNS BATTLEGROUNDS', 'League of Legends', 'Growtopia', 'Team Fortress', 'Counter-Strike', 'Garrys Mod', 'Black Desert Online', 'Rocket Leauge', 'Warframe', 'Battlefield', 'Half-Life', 'Rust', 'H1Z1', 'Fortnite', 'Overwatch', 'World of Tanks'];
    var cumle = cumleler[Math.floor(Math.random() * cumleler.length)];
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Oyun öneri;')
    .setDescription(cumle)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'espri' || command === 'espiri') {
    var espriler = ['Seni görünce; \ngözlerim dolar, \nkulaklarım euro.','Gidenin arkasına bakmayın yoksa geleni göremezsiniz.','+Oğlum canlılara örnek ver. \n-Kedi, köpek. \n+Cansızlara örnek ver. \n-Ölü kedi, ölü köpek.','+Kanka ben banyoya 3 kişi giriyorum. \n-Oha nasıl? \n+Hacı, Şakir ve ben. \n-Defol lan!','+Kocanızla ortak özelliğiniz ne? \n-Aynı gün evlendik.','+Evladım ödevini neden yapmadın? \n-Bilgisayarım uyku modundaydı, uyandırmaya kıyamadım.','+Bizim arkadaş ortamında paranın lafı bile olmaz. \n-Niye ki? \n+Çünkü hiç birimizin parası yok.','Annemin bahsettiği elalem diye bir örgüt var illuminatiden daha tehlikeli yemin ederim.','+Acıkan var mı ya? \n-Yok bizde tatlı kan var.','Yılanlardan korkma, yılmayanlardan kork.','+Baykuşlar vedalaşırken ne der? \n-Bay bay baykuş.','Beni Ayda bir sinemaya götürme, Marsta bir sinemaya götür.','Aaa siz çok terlemişsiniz durun size terlik getireyim.','Aklımı kaçırdım, 100.000 TL fidye istiyorum.'];
    var espri = espriler[Math.floor(Math.random() * espriler.length)];
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Espri;')
    .setDescription(espri)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'rastgele-sayı') {
    let sayılar = Math.floor(Math.random() * 100)
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Rastgele sayı;')
    .setDescription(sayılar)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'rastgele-kullanıcı') {
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Rastgele kullanıcı;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Popcy', client.user.avatarURL).setTimestamp()); }
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Rastgele kullanıcı;')
    .setDescription(message.guild.members.random().displayName)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'yazı-tura') {
    var result = Math.floor((Math.random() * 2) + 1);
    if (result == 1) {
      const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Yazı-tura;')
      .setDescription('Tura.')
      .setImage('https://i.hizliresim.com/MaoYG2.jpg')
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
      message.channel.send(embed);
    } else if (result == 2) {
      const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Yazı-tura;')
      .setDescription('Yazı.')
      .setImage('https://i.hizliresim.com/QpvX3G.jpg')
      .setFooter('Popcy', client.user.avatarURL)
      .setTimestamp()
      message.channel.send(embed);
    }
        };
  
  if (command === 'taş-kağıt-makas' || command === 'tkm') {
    var cumleler= ['Taş.', 'Kağıt.', 'Makas.'];
    var cumle = cumleler[Math.floor(Math.random() * cumleler.length)];
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Taş-kağıt-makas;')
    .setDescription(cumle)
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'sigara') {
    message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sigara;').setDescription(':smoking: :cloud::cloud::cloud::cloud:').setFooter('Popcy', client.user.avatarURL).setTimestamp())
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sigara;').setDescription(':smoking: :cloud::cloud::cloud:').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sigara;').setDescription(':smoking: :cloud::cloud:').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sigara;').setDescription(':smoking: :cloud::cloud::cloud:').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sigara;').setDescription(':smoking: :cloud::cloud:').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sigara;').setDescription(':smoking: :cloud:').setFooter('Popcy', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sigara;').setDescription('Sigaram bitti.').setFooter('Popcy', client.user.avatarURL).setTimestamp()))

  }
  if (command === 'topla') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Topla;').setDescription(message.author.tag + ', kullanım: tr!topla <sayı> <sayı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p+c);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Cevap;')
    .setDescription(total || message.author.tag + ', harfler yerine sayılar yaz.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'çıkar') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Çıkar;').setDescription(message.author.tag + ', kullanım: tr!çıkar <sayı> <sayı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p-c);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Cevap;')
    .setDescription(total || message.author.tag + ', harfler yerine sayılar yaz.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'çarp') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Çarp;').setDescription(message.author.tag + ', kullanım: tr!çarp <sayı> <sayı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p*c);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Cevap;')
    .setDescription(total || message.author.tag + ', harfler yerine sayılar yaz.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'böl') {
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Böl;').setDescription(message.author.tag + ', kullanım: tr!böl <sayı> <sayı>.').setFooter('Popcy', client.user.avatarURL).setTimestamp());
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p/c);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Cevap;')
    .setDescription(total || message.author.tag + ', harfler yerine sayılar yaz.')
    .setFooter('Popcy', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

});


client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  if (message.author.id === ayarlar.sahip2) permlvl = 4;
  if (message.author.id === ayarlar.sahip3) permlvl = 4;
  return permlvl;
};



var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(ayarlar.token);
