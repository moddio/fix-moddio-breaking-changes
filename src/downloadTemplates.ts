const jsonfile = require('jsonfile')
const axios = require('axios');

['https://www.modd.io/api/template/?populateGame=true&type=GENRE', 'https://www.modd.io/api/template/?populateGame=true&type=MAP'].forEach(url => {
  axios.get(url)
    .then((res: any) => {
      res.data.message.tagged.forEach((e: any) => {
        jsonfile.writeFileSync(`./input/${e.game.title}.json`, { ...e.game, data: e.release.data });
      });
    })
})



