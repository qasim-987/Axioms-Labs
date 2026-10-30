// Optional isolated PostgreSQL-WASM test; no production DB is contacted.
const { PGlite } = require('@electric-sql/pglite');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role;');
    await db.exec(fs.readFileSync('backend/migrations/001_inquiry_outbox.sql', 'utf8'));
    const record = { inquiry_id: 'qa-one', request_key: 'dedupe-one', client_name: 'QA', email: 'qa@example.com', company: '', service: 'Web', budget: 'Unspecified', message: 'Test inquiry', phone: '', source: 'qa' };
    const enqueue = r => db.query('select enqueue_inquiry($1::jsonb,$2::text[]) as result', [JSON.stringify(r), ['email']]);
    const first = await enqueue(record);
    const duplicate = await enqueue({ ...record, inquiry_id: 'qa-duplicate' });
    assert.equal(first.rows[0].result.id, duplicate.rows[0].result.id);
    assert.equal((await db.query('select count(*)::int as n from inquiry_outbox')).rows[0].n, 1);
    const claim = async () => (await db.query('select claim_inquiry_jobs() as jobs')).rows[0].jobs;
    const [job] = await claim();
    assert.equal(job.attempts, 1);
    assert.equal((await claim()).length, 0, 'leased job cannot be claimed twice');
    await db.query('select finish_inquiry_job($1,$2,false)', [job.id, job.lease_token]);
    assert.equal((await db.query('select state from inquiry_outbox')).rows[0].state, 'pending');
    await db.exec("update inquiry_outbox set available_at=now()-interval '1 minute'");
    const [retry] = await claim();
    assert.equal(retry.attempts, 2);
    await db.query('select finish_inquiry_job($1,$2,true)', [job.id, job.lease_token]);
    assert.equal((await db.query('select state from inquiry_outbox')).rows[0].state, 'processing', 'stale lease cannot finish a reclaimed job');
    await db.query('select finish_inquiry_job($1,$2,true)', [retry.id, retry.lease_token]);
    assert.equal((await db.query('select state from inquiry_outbox')).rows[0].state, 'sent');
    await db.exec("update inquiry_outbox set state='processing', attempts=5,available_at=now()-interval '1 minute'");
    await claim();
    assert.equal((await db.query('select state from inquiry_outbox')).rows[0].state, 'failed');
    await db.exec('set role anon');
    await assert.rejects(() => db.query('select * from contact_inquiries'), /permission denied/);
    await assert.rejects(() => db.query('select claim_inquiry_jobs()'), /permission denied/);
    console.log('PASS: migration, atomic enqueue, dedupe, leases, retry, stale-token guard, exhausted crash recovery, anonymous access denied');
  } finally { await db.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
