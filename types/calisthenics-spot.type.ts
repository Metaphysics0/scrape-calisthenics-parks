export interface CalisthenicsSpot {
  id: string;
  name: string;
  address: string;
  starCount: number; // 1-5
  equipment: string[];
  discipline: string[];
  tags: Tag[];
  summary?: string;
}

interface Tag {
  name: string;
  iconClassName?: string;
}
