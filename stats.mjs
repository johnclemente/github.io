/*
 * Local analytics + messages viewer. Reads DATABASE_URL from .env (gitignored).
 * Usage: npm run stats          (last 30 days)
 *        npm run stats -- 7     (last 7 days)
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const days = Number(process.argv[2]) || 30;

const match = readFileSync(new URL(".env", import.meta.url), "utf8").match(
  /^DATABASE_URL=(.+)$/m
);
if (!match) {
  console.error("No DATABASE_URL in .env — grab it from the Neon console Connect dialog.");
  process.exit(1);
}
const sql = neon(match[1].trim().replace(/^["']|["']$/g, ""));

const show = async (label, text) => {
  const r = await sql.query(text);
  const rows = r.rows ?? r;
  console.log(`\n== ${label} ==`);
  if (rows.length === 0) console.log("(none)");
  else console.table(rows);
};

await show(
  `Views & visitors per day (last ${days}d)`,
  `select occurred_at::date as day, count(*)::int as views,
          count(distinct session_id)::int as visitors
   from page_views where occurred_at > now() - interval '${days} days'
   group by 1 order by 1 desc`
);

await show(
  "Top referrers",
  `select coalesce(nullif(referrer,''),'(direct)') as referrer, count(*)::int as views
   from page_views where occurred_at > now() - interval '${days} days'
   group by 1 order by 2 desc limit 15`
);

await show(
  "Devices",
  `select case when viewport_w < 768 then 'mobile'
               when viewport_w < 1100 then 'tablet'
               else 'desktop' end as device, count(*)::int as views
   from page_views where occurred_at > now() - interval '${days} days'
   group by 1 order by 2 desc`
);

await show(
  "Where (timezone / language)",
  `select timezone, language, count(*)::int as views
   from page_views where occurred_at > now() - interval '${days} days'
   group by 1, 2 order by 3 desc limit 15`
);

await show(
  "Contact messages (latest 25)",
  `select to_char(created_at, 'YYYY-MM-DD HH24:MI') as received, name, email,
          left(message, 100) as message
   from contact_messages order by created_at desc limit 25`
);
