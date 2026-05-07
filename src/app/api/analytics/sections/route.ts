import { NextResponse } from "next/server";
import { getPool, isDbConfigured } from "@/lib/db";
import { GROUP_A_EMIS, GROUP_B_EMIS, GROUP_C_EMIS } from "@/lib/nieteGroupsData";

export const dynamic = "force-dynamic";

// Returns average FICO section scores (B, C, D) per arm.
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
    section_scores AS (
      SELECT
        a.observation_id,
        sec.title AS section,
        ROUND(
          100.0 * SUM(CASE opt.value WHEN 'YES' THEN 1.0 WHEN 'PARTIAL' THEN 0.5 WHEN 'NO' THEN 0.0 ELSE NULL END)
            / NULLIF(COUNT(CASE WHEN opt.value IN ('YES','PARTIAL','NO') THEN 1 END), 0),
          1
        ) AS pct
      FROM fde_production.coaching_observationanswer a
      JOIN fde_production.coaching_observationquestion  q   ON q.id   = a.question_id
      JOIN fde_production.coaching_observationsection   sec ON sec.id = q.section_id
      LEFT JOIN fde_production.coaching_questionoption  opt ON opt.id = a.single_choice_option_id
      WHERE q.is_scored   = true
        AND sec.is_scored = true
        AND a.observation_id IN (SELECT obs_id FROM obs_group)
      GROUP BY a.observation_id, sec.title
    )
    SELECT
      ss.section,
      og.grp,
      ROUND(AVG(ss.pct), 1)       AS avg_score,
      COUNT(DISTINCT og.obs_id)   AS obs_count
    FROM section_scores ss
    JOIN obs_group og ON og.obs_id = ss.observation_id
    WHERE og.grp IS NOT NULL
    GROUP BY ss.section, og.grp
    ORDER BY ss.section, og.grp
  `;

  try {
    const pool = getPool();
    const result = await pool.query(sql, [GROUP_A_EMIS, GROUP_B_EMIS, GROUP_C_EMIS, from, to]);

    // Pivot to [{ section, A, B, C }]
    const sectionMap: Record<string, { section: string; A: number | null; B: number | null; C: number | null }> = {};
    for (const row of result.rows) {
      const sec = String(row.section);
      if (!sectionMap[sec]) sectionMap[sec] = { section: sec, A: null, B: null, C: null };
      sectionMap[sec][row.grp as "A" | "B" | "C"] = row.avg_score !== null ? Number(row.avg_score) : null;
    }

    const sections = Object.values(sectionMap).sort((a, b) => a.section.localeCompare(b.section));
    return NextResponse.json({ sections, from, to });
  } catch (err: unknown) {
    console.error("Analytics sections error:", err);
    const message = err instanceof Error ? err.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
