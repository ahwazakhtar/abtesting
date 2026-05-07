import { NextResponse } from "next/server";
import { getPool, isDbConfigured } from "@/lib/db";
import { GROUP_A_EMIS, GROUP_B_EMIS, GROUP_C_EMIS } from "@/lib/nieteGroupsData";

export const dynamic = "force-dynamic";

// Returns weekly avg FICO scores and observation counts per arm.
export async function GET(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "2026-04-01";
  const to = searchParams.get("to") ?? "2026-05-31";

  const sql = `
    WITH obs_group AS (
      SELECT
        co.id AS obs_id,
        DATE_TRUNC('week', COALESCE(co.observation_date, co.created::date))::date AS week,
        CASE
          WHEN s.emis = ANY($1::bigint[]) THEN 'A'
          WHEN s.emis = ANY($2::bigint[]) THEN 'B'
          WHEN s.emis = ANY($3::bigint[]) THEN 'C'
        END AS grp
      FROM fde_production.coaching_observation co
      JOIN fde_production.users_teacherprofile   tp ON tp.id = co.user_profile_object_id
      JOIN fde_production.users_user              u  ON u.id  = tp.user_id
      JOIN fde_production.schools_school          s  ON s.id  = tp.school_id
      WHERE co.user_profile_content_type_id = 65
        AND co.deleted_at IS NULL
        AND COALESCE(u.is_testing_account, false) = false
        AND (s.emis = ANY($1::bigint[]) OR s.emis = ANY($2::bigint[]) OR s.emis = ANY($3::bigint[]))
        AND COALESCE(co.observation_date, co.created::date) BETWEEN $4::date AND $5::date
    ),
    obs_scores AS (
      SELECT
        a.observation_id,
        ROUND(
          100.0 * SUM(CASE opt.value WHEN 'YES' THEN 1.0 WHEN 'PARTIAL' THEN 0.5 WHEN 'NO' THEN 0.0 ELSE NULL END)
            / NULLIF(COUNT(CASE WHEN opt.value IN ('YES','PARTIAL','NO') THEN 1 END), 0),
          1
        ) AS pct
      FROM fde_production.coaching_observationanswer a
      JOIN fde_production.coaching_observationquestion q ON q.id = a.question_id
      LEFT JOIN fde_production.coaching_questionoption opt ON opt.id = a.single_choice_option_id
      WHERE q.is_scored = true
        AND a.observation_id IN (SELECT obs_id FROM obs_group)
      GROUP BY a.observation_id
    )
    SELECT
      og.week,
      og.grp,
      ROUND(AVG(os.pct), 1)       AS avg_score,
      COUNT(DISTINCT og.obs_id)   AS obs_count
    FROM obs_group og
    LEFT JOIN obs_scores os ON os.observation_id = og.obs_id
    WHERE og.grp IS NOT NULL
    GROUP BY og.week, og.grp
    ORDER BY og.week, og.grp
  `;

  try {
    const pool = getPool();
    const result = await pool.query(sql, [GROUP_A_EMIS, GROUP_B_EMIS, GROUP_C_EMIS, from, to]);

    // Pivot to { week, A, B, C, obs_A, obs_B, obs_C }
    const weekMap: Record<string, { week: string; A: number | null; B: number | null; C: number | null; obs_A: number; obs_B: number; obs_C: number }> = {};
    for (const row of result.rows) {
      const w = row.week instanceof Date ? row.week.toISOString().slice(0, 10) : String(row.week);
      if (!weekMap[w]) weekMap[w] = { week: w, A: null, B: null, C: null, obs_A: 0, obs_B: 0, obs_C: 0 };
      const grp = row.grp as "A" | "B" | "C";
      weekMap[w][grp] = row.avg_score !== null ? Number(row.avg_score) : null;
      weekMap[w][`obs_${grp}`] = Number(row.obs_count);
    }

    const weeks = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));
    return NextResponse.json({ weeks, from, to });
  } catch (err: unknown) {
    console.error("Analytics weekly error:", err);
    const message = err instanceof Error ? err.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
