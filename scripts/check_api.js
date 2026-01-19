import {
  getResources,
  getResourceAvailabilities,
  createReservation,
  getReservationById,
  setSimulateServerError
} from '../src/api/index.js';

const tests = [];

const assert = (name, cond) => {
  tests.push({ name, pass: !!cond });
  console.log(`${cond ? '✓' : '✗'} ${name}`);
};

const run = async () => {
  console.log('Lancement des vérifications API...');

  setSimulateServerError(false);

  const r1 = await getResources();
  assert('GET /resources -> status 200', r1.status === 200);

  const a1 = await getResourceAvailabilities(1);
  assert('GET /resources/1/availabilities -> 200', a1.status === 200 && Array.isArray(a1.data));

  const a4 = await getResourceAvailabilities(4);
  assert('GET /resources/4/availabilities -> 200 (liste vide)', a4.status === 200 && Array.isArray(a4.data) && a4.data.length === 0);

  const a404 = await getResourceAvailabilities(9999);
  assert('GET /resources/9999/availabilities -> 404', a404.status === 404);

  const bad = await createReservation({});
  assert('POST /reservations -> 400 pour données invalides', bad.status === 400);

  const payload = { resourceId: 3, date: '2026-01-22', startTime: '16:00', endTime: '17:00' };
  const first = await createReservation(payload);
  assert('POST /reservations -> 201 ou 409 (accepté ou conflict)', first.status === 201 || first.status === 409);
  if (first.status === 201) {
    const second = await createReservation(payload);
    assert('POST /reservations (double) -> 409 conflict', second.status === 409);
  }

  const res1 = await getReservationById(1);
  assert('GET /reservations/1 -> 200 ou 404', res1.status === 200 || res1.status === 404);

  setSimulateServerError(true);
  const srvErr = await getResources();
  assert('GET /resources -> 500 en cas d erreur serveur simulée', srvErr.status === 500);
  setSimulateServerError(false);

  const failed = tests.filter(t => !t.pass).length;
  console.log('\nRésumé: ' + (tests.length - failed) + '/' + tests.length + ' succès');
  process.exit(failed === 0 ? 0 : 2);
};

run().catch(err => {
  console.error('Erreur lors des vérifications:', err);
  process.exit(3);
});
