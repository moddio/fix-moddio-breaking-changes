
{
  const jsonfile = require('jsonfile')
  const axios = require('axios');
  const url = 'https://www.modd.io/api/game/683d442894e55a85502de7bc/all-world-maps/';

  axios.get(url)
    .then((res: any) => {
      const data = res.data;
      if (data.status === 'success') {
        data.data.forEach((game: any) => {
          const slug = game.gameSlug;       
          const name = game.title;   
          axios.get(`https://www.modd.io/api/game/${slug}/gamebyslug/`)
            .then((res: any) => {
              jsonfile.writeFileSync(`./backup/tom/${name}.json`, res.data);
            })
        });
        console.log('download successfully');
      } else {
        console.error('failed to download');
      }
    })
}


