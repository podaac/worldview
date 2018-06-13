const cheerio = require('cheerio');
const fs = require('fs');
// walk through directory to collect html file paths, parse for links, and return array of link objects

// create collection of HTML file addresses from directory
const walk = (dir) => {
  let results = [];
  let list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else { 
      // results.push(file);
      file_type = file.split(".").pop();
      file_name = file.split(/(\\|\/)/g).pop();
      if (file_type == "html") {
        results.push(file);
      }
    }
  });
  return results;
}

// get URLS from HTML in ./build/options using cheerio
const getUrls = (htmlArray) => {
  // skip exact (rel and href) doubles of links
  const trackDoubles = {};
  const scrapedHTML = [];

  for (let i = 0; i < htmlArray.length; i++) {
    let $ = cheerio.load(fs.readFileSync(htmlArray[i]));
    let links = $('a');

    // create url object:
    // { 'AIRS - The AIRS instrument suite physical retrievals': 'http://airs.jpl.nasa.gov/data/physical_retrievals' }
    $(links).each(function(i, link) {
      let linkRel = $(link).text() || 'EMPTY';
      let linkHref = $(link).attr('href');

      if (trackDoubles[linkRel] !== linkHref) {
        scrapedHTML.push({[linkRel]: linkHref});
        trackDoubles[linkRel] = linkHref;
      } 
    })
  }
  return scrapedHTML;
}

// get URLS from HTML files
// scraped URLs are saved in an array of objects with a key value pair of link text and href:
// 'Wildfire MB-CE042, Manitoba, Canada': 'https://eonet.sci.gsfc.nasa.gov/api/v2.1/events/EONET_3518'
const initExtractor = async () => {
  // any html file with a url will be scraped and added
  const htmlFiles = await walk('./build/options');
  const htmlUrls = await getUrls(htmlFiles);
  return htmlUrls;
};

module.exports = initExtractor;