// Equipment catalog for the building gym. Edit this when something is added,
// removed or broken; the generator only uses exercises whose equipment is here.

export type EquipmentId =
  | "dumbbells"
  | "bench_adjustable"
  | "bench_decline"
  | "cable"
  | "pullup_bar"
  | "smith"
  | "plates"
  | "leg_ext_curl"
  | "lat_row_press"
  | "kettlebells"
  | "med_balls"
  | "slam_ball"
  | "band"
  | "dip_belt"
  | "ez_bar"
  | "barbell"
  | "treadmill"
  | "bike"
  | "elliptical"
  | "stability_ball"
  | "mat";

export interface Equipment {
  id: EquipmentId;
  name: string;
  detail?: string;
  /** Available load steps, if the equipment has fixed increments. */
  loads?: number[];
  available: boolean;
}

const dumbbellLoads = [5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 75];
const stackLoads = Array.from({ length: 20 }, (_, i) => (i + 1) * 10);

export const EQUIPMENT: Equipment[] = [
  { id: "dumbbells", name: "Hex dumbbells", detail: "5–75 lb, 3-tier TAG rack", loads: dumbbellLoads, available: true },
  { id: "bench_adjustable", name: "Adjustable bench", detail: "Flat and incline", available: true },
  { id: "bench_decline", name: "Decline / sit-up bench", detail: "Leg rollers", available: true },
  { id: "cable", name: "BATCA cable crossover", detail: "Two 200 lb stacks, rope, handles, ankle strap", loads: stackLoads, available: true },
  { id: "pullup_bar", name: "Pull-up bar", detail: "On the BATCA frame", available: true },
  { id: "smith", name: "BATCA Smith machine", detail: "Counterbalanced bar", available: true },
  { id: "plates", name: "Olympic plates", detail: "2.5–45 lb on the Smith pegs", available: true },
  { id: "leg_ext_curl", name: "SportsArt leg extension / leg curl", detail: "DF-200", loads: stackLoads, available: true },
  { id: "lat_row_press", name: "SportsArt lat pulldown / mid row / chest press", detail: "DF-203", loads: stackLoads, available: true },
  { id: "kettlebells", name: "Kettlebells", detail: "~8–30 kg TAG set", loads: [8, 10, 12, 14, 16, 18, 20, 24, 30], available: true },
  { id: "med_balls", name: "Medicine balls", detail: "~6–12 lb", available: true },
  { id: "slam_ball", name: "Slam ball", available: true },
  { id: "band", name: "Resistance band", detail: "Red loop band", available: true },
  { id: "dip_belt", name: "Dip belt", available: true },
  { id: "ez_bar", name: "EZ curl bar", detail: "With plates", available: true },
  { id: "barbell", name: "Straight barbell", detail: "No rack — floor and bench work only", available: true },
  { id: "treadmill", name: "Treadmill", available: true },
  { id: "bike", name: "Indoor bike", available: true },
  { id: "elliptical", name: "Elliptical", available: true },
  { id: "stability_ball", name: "Stability ball", detail: "Yoga room", available: true },
  { id: "mat", name: "Yoga mats", detail: "Yoga room", available: true },
];

export const equipmentById = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e])) as Record<EquipmentId, Equipment>;
