import { JSDOM } from 'jsdom';
import { fetchPage } from './fetch';
import type { CalisthenicsSpot } from '../types/calisthenics-spot.type';

export async function fetchSpotPageAndExtractData(spotUrl: string) {
  console.log(`Fetching spot page ${spotUrl}`);
  const html = await fetchPage(spotUrl);
  const document = new JSDOM(html).window.document;

  console.log(`Extracting data from spot page ${spotUrl}`);

  const data = {
    id: spotUrl.split('/').at(-1),
    ...extractDataFromSpotPage(document),
  };

  await Bun.write(`./data/${data.id}.json`, JSON.stringify(data));

  console.log(`Extracted data from spot page ${spotUrl}`);

  return data;
}

function extractDataFromSpotPage(
  spotPage: Document
): Omit<CalisthenicsSpot, 'id'> {
  const extractor = new DataExtractor(spotPage);
  return {
    name: extractor.spotName,
    address: extractor.address,
    summary: extractor.summary,
    equipment: extractor.equipment,
    discipline: extractor.discipline,
    starCount: extractor.starCount,
    tags: extractor.tags,
  };
}

class DataExtractor {
  constructor(private readonly spotPage: Document) {}

  get tags(): CalisthenicsSpot['tags'] {
    const tags = this.spotPage.querySelectorAll(
      '.list-inline.localizationActions.shrinked li'
    );
    if (tags.length === 0) return [];

    return Array.from(tags).map((li) => ({
      name: (li as Element).textContent?.trim() ?? '',
      iconClassName: li?.getElementsByTagName('span')?.[0]?.className ?? '',
    }));
  }

  get starCount(): CalisthenicsSpot['starCount'] {
    return this.spotPage.querySelectorAll('section#well p .st-icon-favorite')
      .length;
  }

  get summary(): CalisthenicsSpot['summary'] {
    const summaryText =
      (
        this.spotPage.querySelector('section#details') as Element
      )?.textContent?.trim() ?? '';

    return summaryText
      .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with single space
      .split('View more details')[0] // Remove everything after "View more details"
      .trim();
  }

  get address(): CalisthenicsSpot['address'] {
    return (
      (this.spotPage.querySelector('address') as Element)?.textContent
        ?.trim()
        ?.split('Address')
        ?.pop()
        ?.trim() ?? ''
    );
  }

  get spotName(): CalisthenicsSpot['name'] {
    return (
      (
        this.spotPage.querySelector('section#well h1') as Element
      )?.textContent?.trim() ?? ''
    );
  }

  get equipment(): CalisthenicsSpot['equipment'] {
    const equipmentElements = this.spotPage.querySelectorAll(
      'section#equipment a'
    );
    return Array.from(equipmentElements).map((a) =>
      (a as Element).textContent?.trim()
    ) as string[];
  }

  get discipline(): CalisthenicsSpot['discipline'] {
    const disciplineElements = this.spotPage.querySelectorAll(
      'section#discipline a'
    );
    return Array.from(disciplineElements).map((a) =>
      (a as Element).textContent?.trim()
    ) as string[];
  }
}
