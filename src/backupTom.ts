
{
  const jsonfile = require('jsonfile');
  const axios = require('axios');
  const fs = require('fs');
  const path = require('path');
	require('dotenv').config();
  const url = 'https://www.modd.io/api/game/683d442894e55a85502de7bc/all-world-maps/';

	const cookie = process.env.MODD_COOKIE; // Set in .env as MODD_COOKIE
	if (!cookie) {
		console.error('Missing MODD_COOKIE. Create a .env file with MODD_COOKIE=<your cookie>');
		process.exit(1);
	}

  const args = process.argv.slice(2);
  const shouldDelete = args.includes('--delete');

  axios.get(url, { headers: { Cookie: cookie } })
    .then((res: any) => {
      const data = res.data;
      if (data.status === 'success') {
        data.data.forEach((game: any, idx: number) => {
          setTimeout(() => {
            const slug = game.gameSlug;
            const name = game.title;
            const dir = `./tom/${name}`;

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            if (shouldDelete) {
              // Delete the oldest file in the directory
              const files = fs.readdirSync(dir);
              if (files.length > 0) {
                const oldestFile = files.map((file: string) => ({
                  name: file,
                  time: fs.statSync(path.join(dir, file)).mtime.getTime()
                }))
                  .sort((a: { time: number }, b: { time: number }) => a.time - b.time)[0].name;
                fs.unlinkSync(path.join(dir, oldestFile));
              }
            } else {
              axios.get(`https://www.modd.io/api/game/${slug}/gamebyslug/`, { headers: { Cookie: cookie } })
                .then((res: any) => {
                  const date = new Date();
                  const formattedDate = date.toISOString().replace(/[-:]/g, '').split('.')[0];
                  jsonfile.writeFileSync(`${dir}/${name}_${formattedDate}.json`, res.data);
                });
            }
          }, 300 * idx)

        });
        console.log('Operation completed successfully');
      } else {
        console.error('Failed to download');
      }
    });
}


