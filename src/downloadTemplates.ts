import jsonfile from 'jsonfile'
import fs from 'fs'
import axios from 'axios';

['https://www.modd.io/api/template/?populateGame=true&type=GENRE', 'https://www.modd.io/api/template/?populateGame=true&type=MAP'].forEach(url => {
  axios.get(url)
    .then((res) => {
      res.data.message.forEach((e: any) => {
        jsonfile.writeFileSync(`./input/${e.game.title}.json`, { ...e.game, data: e.release.data });
      });
    })
})



