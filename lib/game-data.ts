import gameBoards from '../data/destinations.json';

export type Option = {
  text: string;
  destination: number;
  requirements: string[];
  effects: string[];
};

export type Destination = {
  id: number;
  title?: string;
  description: string;
  options: Option[];
  requirements: string[];
  effects: string[];
};

class GameData {
  private destinations: Map<number, Destination>;

  constructor() {
    this.destinations = new Map();
    this.loadDestinations();
  }

  private loadDestinations() {
    gameBoards.forEach((destination) => {
      this.destinations.set(destination.id, destination as Destination);
    });
  }

  getDestination(id: number): Destination | undefined {
    return this.destinations.get(id);
  }

  getAllDestinations(): Destination[] {
    return Array.from(this.destinations.values());
  }

  checkRequirements(requirements: string[], playerEffects: string[]): boolean {
    return (
      requirements.length === 0 ||
      requirements.some((req) => playerEffects.includes(req))
    );
  }
}

export const gameData = new GameData();
