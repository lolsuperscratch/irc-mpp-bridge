var irc = require('irc');
var Client = require('mpp-client-xt');
var mpp = new Client();
setInterval(function () {mpp.setName('[http://kiwiirc.com/client/irc.freenode.net/mppbridge]')})
mpp.setChannel('lobby')
mpp.start()
var channelclients = [{client:mpp,channel:"#mppbridge-lobby"}];

var client = new irc.Client('irc.freenode.net', 'mppbridge', {
    realName: 'Multiplayer Piano Bridge',
    channels: ['#mppbridge','#mppbridge-lobby'],
    autoRejoin: true,
    autoConnect: true
});
client.addListener('message#mppbridge', function (from, message) {
    console.log(from + ' => #mppbridge: ' + message);
    if (message.split(' ')[0] == "mpp!bridge") {
      client.join('#mppbridge-'+message.split(' ').slice(1).join('-'),function () {
          var channeler = '#mppbridge-'+message.split(' ').slice(1).join('-')
          var gClient = new Client();
          channelclients.push({client:gClient,channel:'#mppbridge-'+message.split(' ').slice(1).join('-')});
          gClient.setChannel(message.split(' ').slice(1).join(' '))
          gClient.start()
          
          client.say('#mppbridge','success bridging to '+message.split(' ').slice(1).join(' ')+'. to join, join #mppbridge-'+message.split(' ').slice(1).join('-'))
          gClient.on('a',function(msg) {
             if (msg.p._id !== gClient.user._id) {
                client.say(channeler,msg.p.name+': '+msg.a)
             }
          })
      });
    }
    if (message.split(' ')[0] == "mpp!unbridge") {
       var found = false;
       for (var i = 0;i < channelclients.length;i++) {
        if (text.split(' ').slice(1).join(' ') == channelclients[i].client.channel._id) {
            channelclients[i].client.stop()
            client.say(channelclients[i].channel,'Unbridged by '+from)
            found = true;
        }
       }
       if (!found) return client.say('#mppbridge','channel not found')
       client.say('#mppbridge','succesfully unbridged')
    }
    if (message == "mpp!help") {
       client.say('#mppbridge','commands: mpp!responsecmd [command], mpp!unbridge [channel name], mpp!bridge [channel name]')
    }
});
client.addListener('join#mppbridge',function(nick,message) {
    client.say('#mppbridge','welcome '+nick+'. you can bridge the channels here for using mpp!bridge [channel name], you can also unbridge using mpp!unbridge. for more commands, use mpp!help')
})
client.addListener('message#',function(nick, to, text, message) {
    if (to == "#mppbridge") return;
    if (text.startsWith('mpp!')) return;
    for (var i = 0;i < channelclients.length;i++) {
        if (to == channelclients[i].channel) {
            channelclients[i].client.say(nick+': '+text)
        }
    }
})
client.addListener('message#',function(nick, to, text, message) {
    if (text.split(' ')[0] == "mpp!responsecmd") {
    for (var i = 0;i < channelclients.length;i++) {
        if (to == channelclients[i].channel) {
            channelclients[i].client.say(nick)
            channelclients[i].client.say(text.split(' ').slice(1).join(' '))
        }
    }
    }
})
client.addListener('invite',function(channel, from, message) {
    if (to == "#mppbridge") return client.say(channel,' you need invite to the bridged channels!')
    for (var i = 0;i < channelclients.length;i++) {
        if (channel == channelclients[i].channel) {
            client.say(channel,'http://www.multiplayerpiano.com/'+channelclients[i].client.channel._id.replace(/ /g,'%20'))
        }
    }
})

client.addListener('error', function(message) {
    console.log('error: ', message);
    process.exit()
});
