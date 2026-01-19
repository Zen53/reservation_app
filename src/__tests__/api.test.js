import { describe, it, expect } from 'vitest';
import {
  getResources,
  getResourceAvailabilities,
  createReservation,
  getReservationById,
  setSimulateServerError
} from '../api';

describe('Mock API - Comportement selon le contrat', () => {
  it('GET /resources retourne 200 et une liste', async () => {
    setSimulateServerError(false);
    const res = await getResources();
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('GET /resources/{id}/availabilities retourne 200 ou liste vide', async () => {
    const r1 = await getResourceAvailabilities(1);
    expect(r1.status).toBe(200);
    expect(Array.isArray(r1.data)).toBe(true);

    const r4 = await getResourceAvailabilities(4);
    expect(r4.status).toBe(200);
    expect(Array.isArray(r4.data)).toBe(true);
    expect(r4.data.length).toBe(0); // salle 4 sans disponibilités
  });

  it('GET /resources/{id}/availabilities retourne 404 pour ressource inexistante', async () => {
    const res = await getResourceAvailabilities(9999);
    expect(res.status).toBe(404);
  });

  it('POST /reservations valide 400 pour données invalides', async () => {
    const res = await createReservation({});
    expect(res.status).toBe(400);
  });

  it('POST /reservations crée une réservation (201) puis conflit (409) si double réservation', async () => {
    const payload = { resourceId: 3, date: '2026-01-22', startTime: '16:00', endTime: '17:00' };
    // première tentative
    const first = await createReservation(payload);
    expect(first.status === 201 || first.status === 409).toBe(true);
    if (first.status === 201) {
      // seconde tentative doit retourner 409
      const second = await createReservation(payload);
      expect(second.status).toBe(409);
    }
  });

  it('GET /reservations/{id} retourne 200 ou 404', async () => {
    const res = await getReservationById(1);
    expect([200, 404].includes(res.status)).toBe(true);
  });

  it('Erreur technique (500) est propagée', async () => {
    setSimulateServerError(true);
    const res = await getResources();
    expect(res.status).toBe(500);
    setSimulateServerError(false);
  });
});
