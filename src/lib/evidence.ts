import type { Goal } from "./generate";

// What the generator's numbers rest on. "strong" = position stand or
// meta-analysis read directly; "moderate" = meta-analysis via summary;
// "convention" = common practice with thin or no pooled evidence.

export type Grade = "strong" | "moderate" | "convention";

export interface Claim {
  text: string;
  grade: Grade;
  source: string;
  url: string;
}

const ACSM_2026 = { source: "acsm position stand, 2026", url: "https://www.ovid.com/jnls/acsm-msse/fulltext/10.1249/mss.0000000000003897~american-college-of-sports-medicine-position-stand" };
const WHO_2020 = { source: "who physical activity guidelines, 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/" };
const SCHOENFELD_2021 = { source: "schoenfeld et al., sports, 2021", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7927075/" };
const GRGIC_2018 = { source: "grgic et al., sports medicine, 2018", url: "https://link.springer.com/article/10.1007/s40279-017-0788-x" };
const BEHM_2016 = { source: "behm et al., appl physiol nutr metab, 2016", url: "https://cdnsciencepub.com/doi/10.1139/apnm-2015-0235" };
const WEWEGE_2017 = { source: "wewege et al., obesity reviews, 2017", url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/obr.12532" };
const LOPEZ_2022 = { source: "lopez et al., obesity reviews, 2022", url: "https://onlinelibrary.wiley.com/doi/full/10.1111/obr.13428" };
const PILATES_LBP = { source: "pilates for low back pain, meta-analysis, 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10164513/" };
const PILATES_HEALTHY = { source: "cruz-ferreira et al., arch phys med rehabil, 2011", url: "https://www.archives-pmr.org/article/S0003-9993(11)00412-6/abstract" };
const BELL_2023 = { source: "bell et al., deloading delphi consensus, 2023", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10511399/" };

export const GENERAL_CLAIMS: Claim[] = [
  { text: "150–300 min a week of moderate cardio, plus strength work on 2+ days for all major muscles.", grade: "strong", ...WHO_2020 },
  { text: "any bout length counts; the old 10-minute minimum is gone.", grade: "strong", ...WHO_2020 },
  { text: "stop 2–3 reps short of failure. going to failure isn't better and is harder to recover from.", grade: "strong", ...ACSM_2026 },
  { text: "warm up with easy cardio and movement; long static stretches before lifting cost about 4% performance. stretch after instead.", grade: "moderate", ...BEHM_2016 },
  { text: "when you hit the top of the rep range on every set, add the next weight step and drop back to the bottom of the range.", grade: "convention", ...ACSM_2026 },
  { text: "take an easier week every 4–8 weeks if you feel beaten up. experts agree deloads help; the timing is practice, not proof.", grade: "convention", ...BELL_2023 },
  { text: "effort burn is fine. sharp, joint, or radiating pain means stop.", grade: "convention", source: "standard clinical guidance", url: "" },
];

export const GOAL_CLAIMS: Record<Goal, Claim[]> = {
  muscle: [
    { text: "at least 10 hard sets per muscle per week; gains keep rising to around 18–20.", grade: "strong", ...ACSM_2026 },
    { text: "muscle grows about the same anywhere from ~30% to 85% of max. 8–12 reps is just the most time-efficient zone.", grade: "strong", ...SCHOENFELD_2021 },
    { text: "rest 60–90 seconds or more between sets; shorter rest costs a little growth.", grade: "moderate", ...GRGIC_2018 },
    { text: "hit each muscle twice a week; spreading sets across days beats one long day.", grade: "moderate", source: "schoenfeld et al., sports medicine, 2016", url: "https://link.springer.com/article/10.1007/s40279-016-0543-8" },
  ],
  strength: [
    { text: "loads at 80% of max or heavier give the biggest strength gains — that's roughly 1–6 reps.", grade: "strong", ...ACSM_2026 },
    { text: "2–3 sets per exercise per session is enough; more gives diminishing returns.", grade: "strong", ...ACSM_2026 },
    { text: "full range of motion, strength lifts first in the session, 2+ (ideally 3) sessions a week.", grade: "strong", ...ACSM_2026 },
    { text: "rest 2+ minutes between heavy sets if you're experienced; 1–2 minutes is enough for beginners.", grade: "moderate", ...GRGIC_2018 },
  ],
  fatloss: [
    { text: "fat loss is mostly about the calorie deficit. training protects muscle while you lose it.", grade: "moderate", ...LOPEZ_2022 },
    { text: "intervals and steady cardio lose the same fat; intervals just take ~40% less time.", grade: "moderate", ...WEWEGE_2017 },
    { text: "aim for 150–250 min a week of cardio to hold weight, 250+ to lose it.", grade: "moderate", source: "acsm weight-loss position stand, 2009", url: "https://pubmed.ncbi.nlm.nih.gov/19127177/" },
    { text: "higher reps with short rest isn't a special 'toning' zone. it's just a way to fit more work in less time.", grade: "strong", ...SCHOENFELD_2021 },
  ],
  general: [
    { text: "the difference between training plans is small compared with the difference between training and not.", grade: "strong", source: "currier et al., bjsm, 2023", url: "https://bjsm.bmj.com/content/57/18/1211" },
    { text: "2 strength days plus cardio across the week meets the who minimum.", grade: "strong", ...WHO_2020 },
  ],
  pilates: [
    { text: "mat pilates clearly improves flexibility and balance, and moderately improves muscular endurance.", grade: "moderate", ...PILATES_HEALTHY },
    { text: "for low back pain it cuts pain by about 2 points out of 10 and improves function; not clearly better than other exercise.", grade: "strong", ...PILATES_LBP },
    { text: "the 'core strength' claim is weakly supported; think of pilates as control, mobility and endurance.", grade: "moderate", ...PILATES_HEALTHY },
    { text: "2–3 sessions a week of 30–60 minutes is what trials used. there's no proven optimum dose.", grade: "convention", ...PILATES_LBP },
    { text: "sequence and cues follow the classical mat order (return to life, 1945). skip roll-over and neck pull with neck or back issues.", grade: "convention", source: "joseph pilates, return to life through contrology, 1945", url: "https://pilatesology.com/wp-content/uploads/2015/12/Mat-JosephPilatesReturntoLife.pdf" },
  ],
};
