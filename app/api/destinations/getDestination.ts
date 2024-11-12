'use server';
import { Destination } from './destination';

export async function getDestination(id: number): Promise<Destination> {
  try {
    const response = await fetch(`${process.env.API_URL}/destinations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const destination = await response.json();
    return destination;
  } catch (error) {
    console.error('Failed to fetch destination:', error);
    throw error;
  }
}
