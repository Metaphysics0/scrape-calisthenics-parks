import { JSDOM } from 'jsdom';
import { fetchPage } from './fetch';
import { fetchSpotPageAndExtractData } from './fetch-spot-page-and-extract-data';

const TOTAL_PAGES = 10;
const pagesNumbers = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

const getSearchUrl = (page: number) =>
  `https://calisthenics-parks.com/spots?page=${page}`;

const getSpotUrlFromSpotListItem = (spotListItem: Element) => {
  const relevantLink = Array.from(spotListItem.getElementsByTagName('a')).find(
    (a) => a.href.includes('/spots/')
  );

  if (!relevantLink) {
    console.log('No relevant link found in spot list item');
    return null;
  }

  return relevantLink?.href;
};

async function getSpotUrlsFromSearchPage(page: number) {
  const url = getSearchUrl(page);

  console.log(`Fetching search page ${url}`);
  const html = await fetchPage(url);

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const spotsList = document.getElementById('spots-list');
  const spots = spotsList?.getElementsByTagName('li');

  const spotUrls = [];

  for (const spotListItem of Array.from(spots!)) {
    const spotUrl = getSpotUrlFromSpotListItem(spotListItem);
    if (spotUrl) {
      spotUrls.push(spotUrl);
    }
  }

  console.log(`Found ${spotUrls.length} spot URLs from search page ${page}`);
  return spotUrls;
}

async function getDataFromAllResultsOnSpotPage(pageNumber: number) {
  console.log(`Getting spot URLs from search page ${pageNumber}`);
  const spotUrls = await getSpotUrlsFromSearchPage(pageNumber);

  console.log(`Found ${spotUrls.length} spot URLs`);

  await Promise.allSettled(spotUrls.map(fetchSpotPageAndExtractData));
}

await Promise.allSettled(pagesNumbers.map(getDataFromAllResultsOnSpotPage));
