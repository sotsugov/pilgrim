export type Destination = {
  id: number;
  title?: string;
  description: string;
  options?: {
    text: string;
    destination: number;
    requirements: string[];
    effects: string[];
  }[];
  requirements: string[];
  effects: string[];
};
