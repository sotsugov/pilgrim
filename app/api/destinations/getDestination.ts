'use server';

import { Destination } from './destination';

export async function getDestination(id: number): Promise<Destination> {
  if (!process.env.API_URL) {
    throw new Error('API_URL is not configured');
  }

  try {
    const response = await fetch(`${process.env.API_URL}/destinations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Destination ${id} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const destination = await response.json();
    return destination;
  } catch (error) {
    console.error('Failed to fetch destination:', error);
    throw error;
  }
}
