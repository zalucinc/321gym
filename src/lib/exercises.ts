import type { EquipmentId } from "./equipment";

/** Movement pattern. The generator fills a session by pattern, then picks an exercise. */
export type Pattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "glutes"
  | "hpush"
  | "vpush"
  | "hpull"
  | "vpull"
  | "core"
  | "arms"
  | "shoulders_iso"
  | "legs_iso"
  | "conditioning"
  | "cardio"
  | "mobility";

/** How load is added, which drives progression increments. */
export type LoadType = "dumbbell" | "stack" | "plate" | "kettlebell" | "bodyweight" | "time";

export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  equipment: EquipmentId[];
  muscles: string[];
  load: LoadType;
  /** Per-side movement: reps are per leg/arm. */
  unilateral?: boolean;
  /** Timed hold or interval instead of reps. */
  timed?: boolean;
  /** free-exercise-db id: two photos, start and end position. */
  media?: string;
  howTo: string[];
  cues: string[];
  mistakes?: string[];
}

export const EXERCISES: Exercise[] = [
  // ---- Squat ---------------------------------------------------------------
  {
    id: "smith_squat",
    media: "Smith_Machine_Squat",
    name: "Smith machine squat",
    pattern: "squat",
    equipment: ["smith", "plates"],
    muscles: ["quads", "glutes"],
    load: "plate",
    howTo: [
      "Set the bar at upper-chest height. Stand with feet slightly in front of the bar, shoulder width.",
      "Unrack by rotating the bar off the hooks. Brace your core.",
      "Sit down until thighs are at least parallel, knees tracking over toes.",
      "Drive through the whole foot back to standing. Re-rack by rotating the bar.",
    ],
    cues: ["Feet a few inches forward so your torso stays upright", "Control the way down, 2–3 seconds"],
    mistakes: ["Feet directly under the bar, which forces you onto your toes", "Bouncing out of the bottom"],
  },
  {
    id: "goblet_squat",
    media: "Goblet_Squat",
    name: "Goblet squat",
    pattern: "squat",
    equipment: ["dumbbells"],
    muscles: ["quads", "glutes", "core"],
    load: "dumbbell",
    howTo: [
      "Hold one dumbbell vertically against your chest with both hands under the top head.",
      "Feet shoulder width, toes slightly out.",
      "Squat down between your knees, elbows brushing the inside of your thighs at the bottom.",
      "Stand tall, squeezing your glutes.",
    ],
    cues: ["Chest up, elbows down", "Full depth — this one is easy to go deep on"],
  },
  {
    id: "kb_front_squat",
    media: "Front_Squats_With_Two_Kettlebells",
    name: "Kettlebell front squat",
    pattern: "squat",
    equipment: ["kettlebells"],
    muscles: ["quads", "glutes", "core"],
    load: "kettlebell",
    howTo: [
      "Clean a kettlebell to the rack position (resting on your forearm, elbow tucked). Or hold two.",
      "Squat to parallel or below, keeping the bell tight to your body.",
      "Stand up without letting your elbow drift away from your ribs.",
    ],
    cues: ["Stay tall; the offset load wants to twist you", "Breathe in at the top, brace, then squat"],
  },

  // ---- Hinge ---------------------------------------------------------------
  {
    id: "db_rdl",
    media: "Stiff-Legged_Dumbbell_Deadlift",
    name: "Dumbbell Romanian deadlift",
    pattern: "hinge",
    equipment: ["dumbbells"],
    muscles: ["hamstrings", "glutes", "lower back"],
    load: "dumbbell",
    howTo: [
      "Stand with a dumbbell in each hand in front of your thighs, soft knees.",
      "Push your hips straight back, letting the dumbbells slide down your legs.",
      "Stop when you feel a strong hamstring stretch, usually mid-shin. Back stays flat.",
      "Drive hips forward to stand. Squeeze glutes at the top, don't lean back.",
    ],
    cues: ["Think 'close a car door with your butt'", "Dumbbells stay touching your legs the whole time"],
    mistakes: ["Bending the knees into a squat", "Rounding the lower back to reach the floor"],
  },
  {
    id: "kb_swing",
    media: "One-Arm_Kettlebell_Swings",
    name: "Kettlebell swing",
    pattern: "hinge",
    equipment: ["kettlebells", "mat"],
    muscles: ["glutes", "hamstrings", "core"],
    load: "kettlebell",
    howTo: [
      "Bell on the floor a foot in front of you. Hinge, grab it with both hands, hike it back between your legs.",
      "Snap your hips forward hard; the arms are just ropes. The bell floats to chest height.",
      "Let it fall, hinge again as the forearms hit your thighs, repeat.",
      "Park it on the floor to finish — don't just drop it.",
    ],
    cues: ["It's a hinge, not a squat", "Stand up violently, then relax at the top"],
    mistakes: ["Lifting with the arms and shoulders", "Squatting the swing"],
  },
  {
    id: "smith_rdl",
    media: "Smith_Machine_Stiff-Legged_Deadlift",
    name: "Smith machine Romanian deadlift",
    pattern: "hinge",
    equipment: ["smith", "plates"],
    muscles: ["hamstrings", "glutes"],
    load: "plate",
    howTo: [
      "Set the bar at mid-thigh. Stand with the bar touching your thighs, overhand grip.",
      "Unrack, push hips back, lower the bar to mid-shin with a flat back.",
      "Drive hips forward to stand. Re-rack at the top.",
    ],
    cues: ["Bar stays glued to your legs", "Slight knee bend, fixed throughout"],
  },
  {
    id: "smith_hip_thrust",
    media: "Smith_Machine_Hip_Raise",
    name: "Smith machine hip thrust",
    pattern: "glutes",
    equipment: ["smith", "plates", "bench_adjustable"],
    muscles: ["glutes", "hamstrings"],
    load: "plate",
    howTo: [
      "Put the flat bench sideways under the Smith bar. Sit on the floor with your upper back on the bench edge.",
      "Roll the bar over your hips (fold a mat on it for padding). Feet flat, shin vertical at the top.",
      "Unrack by extending your hips. Lower under control, then drive up until your torso is parallel to the floor.",
      "Chin tucked, ribs down. Squeeze at the top for one second.",
    ],
    cues: ["Push through your heels", "Don't over-arch the lower back at the top"],
  },
  {
    id: "db_hip_thrust",
    media: "Barbell_Hip_Thrust",
    name: "Dumbbell hip thrust",
    pattern: "glutes",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["glutes", "hamstrings"],
    load: "dumbbell",
    howTo: [
      "Upper back on the flat bench, dumbbell across your hips.",
      "Drive hips up to a straight line from knees to shoulders. Pause, lower.",
    ],
    cues: ["Shins vertical at the top", "Look forward, not at the ceiling"],
  },

  // ---- Lunge / single leg ----------------------------------------------------
  {
    id: "bulgarian_split_squat",
    media: "Split_Squat_with_Dumbbells",
    name: "Bulgarian split squat",
    pattern: "lunge",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["quads", "glutes"],
    load: "dumbbell",
    unilateral: true,
    howTo: [
      "Stand a long step in front of the flat bench. Put the top of one foot on it behind you.",
      "Holding dumbbells at your sides, lower straight down until the back knee is just off the floor.",
      "Drive through the front foot to stand. Finish all reps, then switch legs.",
    ],
    cues: ["Front shin stays near vertical", "Lean slightly forward for more glute, upright for more quad"],
    mistakes: ["Standing too close to the bench", "Pushing off the back foot"],
  },
  {
    id: "db_walking_lunge",
    media: "Bodyweight_Walking_Lunge",
    name: "Dumbbell walking lunge",
    pattern: "lunge",
    equipment: ["dumbbells"],
    muscles: ["quads", "glutes"],
    load: "dumbbell",
    unilateral: true,
    howTo: [
      "Dumbbells at your sides. Step forward into a lunge, back knee just above the floor.",
      "Push through the front heel and step the back foot forward into the next lunge.",
    ],
    cues: ["Long step, torso tall", "Both knees to about 90°"],
  },
  {
    id: "db_step_up",
    media: "Dumbbell_Step_Ups",
    name: "Dumbbell step-up",
    pattern: "lunge",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["quads", "glutes"],
    load: "dumbbell",
    unilateral: true,
    howTo: [
      "Face the flat bench with dumbbells at your sides. Put one whole foot on it.",
      "Press through that foot to stand on the bench without pushing off the floor leg.",
      "Lower slowly back to the floor. Finish all reps on one leg, then switch.",
    ],
    cues: ["Control the descent — that's where the work is", "Don't hop off the bottom leg"],
  },

  // ---- Horizontal push -------------------------------------------------------
  {
    id: "db_bench_press",
    media: "Dumbbell_Bench_Press",
    name: "Flat dumbbell bench press",
    pattern: "hpush",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["chest", "triceps", "shoulders"],
    load: "dumbbell",
    howTo: [
      "Sit on the flat bench with dumbbells on your thighs. Lie back, kicking them up to your chest.",
      "Feet flat, shoulder blades pinched back and down.",
      "Press up until arms are straight, dumbbells over your chest. Lower to just outside your chest.",
    ],
    cues: ["Elbows about 45° from your body, not flared", "Squeeze the dumbbells together at the top"],
  },
  {
    id: "incline_db_press",
    media: "Incline_Dumbbell_Press",
    name: "Incline dumbbell press",
    pattern: "hpush",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["upper chest", "shoulders", "triceps"],
    load: "dumbbell",
    howTo: [
      "Set the bench to 30–45°. Same setup as the flat press.",
      "Lower the dumbbells to upper-chest level, elbows at 45°, then press up and slightly in.",
    ],
    cues: ["Keep your butt on the bench", "Lower slower than you press"],
  },
  {
    id: "machine_chest_press",
    media: "Leverage_Chest_Press",
    name: "Machine chest press (SportsArt)",
    pattern: "hpush",
    equipment: ["lat_row_press"],
    muscles: ["chest", "triceps"],
    load: "stack",
    howTo: [
      "Sit facing away from the stack, handles at mid-chest. Set the seat so handles line up with your nipples.",
      "Press forward until arms are nearly straight, pause, return under control.",
    ],
    cues: ["Shoulders back against the pad", "Don't lock the elbows hard"],
  },
  {
    id: "pushup",
    media: "Pushups",
    name: "Push-up",
    pattern: "hpush",
    equipment: ["mat"],
    muscles: ["chest", "triceps", "core"],
    load: "bodyweight",
    howTo: [
      "Hands slightly wider than shoulders, body in a straight line.",
      "Lower your chest to an inch off the floor, elbows at 45°. Press back up.",
      "Too hard? Put your hands on the bench. Too easy? Feet on the bench or wear the dip belt with a plate.",
    ],
    cues: ["Squeeze glutes so hips don't sag", "Full lockout at the top"],
  },
  {
    id: "cable_fly",
    media: "Cable_Crossover",
    name: "Cable chest fly",
    pattern: "hpush",
    equipment: ["cable"],
    muscles: ["chest"],
    load: "stack",
    howTo: [
      "Set both pulleys at shoulder height with single handles. Step forward into a staggered stance.",
      "With a soft bend in the elbows, bring your hands together in front of your chest in an arc.",
      "Return slowly until you feel a stretch across the chest.",
    ],
    cues: ["Hug a tree", "Lean slightly forward and keep that angle"],
  },

  // ---- Vertical push -----------------------------------------------------------
  {
    id: "seated_db_shoulder_press",
    media: "Dumbbell_Shoulder_Press",
    name: "Seated dumbbell shoulder press",
    pattern: "vpush",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["shoulders", "triceps"],
    load: "dumbbell",
    howTo: [
      "Set the bench nearly upright (about 80°). Dumbbells at shoulder height, palms forward.",
      "Press straight up until arms are extended, dumbbells almost touching.",
      "Lower to ear level under control.",
    ],
    cues: ["Ribs down, don't arch to push", "Elbows slightly in front of the shoulders"],
  },
  {
    id: "smith_overhead_press",
    media: "Barbell_Shoulder_Press",
    name: "Smith machine overhead press",
    pattern: "vpush",
    equipment: ["smith", "plates", "bench_adjustable"],
    muscles: ["shoulders", "triceps"],
    load: "plate",
    howTo: [
      "Put the upright bench under the bar, bar at chin height when seated.",
      "Grip just outside shoulders. Unrack, press to lockout, lower to the chin.",
    ],
    cues: ["Head goes slightly forward as the bar passes your face", "Keep your lower back on the pad"],
  },
  {
    id: "db_arnold_press",
    media: "Arnold_Dumbbell_Press",
    name: "Arnold press",
    pattern: "vpush",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["shoulders"],
    load: "dumbbell",
    howTo: [
      "Seated, start with dumbbells in front of your shoulders, palms facing you.",
      "Press up while rotating the palms to face forward. Reverse on the way down.",
    ],
    cues: ["Smooth rotation, no jerking", "Lighter than a normal press"],
  },

  // ---- Horizontal pull ---------------------------------------------------------
  {
    id: "one_arm_db_row",
    media: "One-Arm_Dumbbell_Row",
    name: "One-arm dumbbell row",
    pattern: "hpull",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["lats", "upper back", "biceps"],
    load: "dumbbell",
    unilateral: true,
    howTo: [
      "Left knee and left hand on the flat bench, right foot on the floor, back flat.",
      "Dumbbell in the right hand hanging straight down.",
      "Row it to your hip, elbow sweeping back close to your body. Lower fully. Switch sides.",
    ],
    cues: ["Pull with the elbow, not the hand", "Don't twist your torso to lift it"],
  },
  {
    id: "machine_row",
    media: "Leverage_Iso_Row",
    name: "Machine mid row (SportsArt)",
    pattern: "hpull",
    equipment: ["lat_row_press"],
    muscles: ["upper back", "lats", "biceps"],
    load: "stack",
    howTo: [
      "Sit facing the stack, chest on the pad, grab the row handles.",
      "Pull until your elbows pass your torso and your shoulder blades squeeze.",
      "Let the arms extend fully, feel the stretch, repeat.",
    ],
    cues: ["Chest stays on the pad", "Pause one second squeezed"],
  },
  {
    id: "cable_row",
    media: "Seated_Cable_Rows",
    name: "Cable seated row",
    pattern: "hpull",
    equipment: ["cable"],
    muscles: ["upper back", "lats"],
    load: "stack",
    howTo: [
      "Set one pulley low with a handle or the rope. Sit on the floor or a mat facing it, feet braced on the frame.",
      "Pull the handle to your belly button, squeezing the shoulder blades. Return slowly.",
    ],
    cues: ["Torso stays still; only the arms move", "Lead with the elbows"],
  },
  {
    id: "chest_supported_db_row",
    media: "Dumbbell_Incline_Row",
    name: "Chest-supported dumbbell row",
    pattern: "hpull",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["upper back", "rear delts"],
    load: "dumbbell",
    howTo: [
      "Set the bench to 30–45°. Lie face down on it with dumbbells hanging below.",
      "Row both dumbbells up to your ribs, pause, lower.",
    ],
    cues: ["Zero momentum — the bench takes cheating away", "Elbows about 45° from your torso"],
  },

  // ---- Vertical pull -------------------------------------------------------------
  {
    id: "pullup",
    media: "Pullups",
    name: "Pull-up",
    pattern: "vpull",
    equipment: ["pullup_bar"],
    muscles: ["lats", "biceps", "upper back"],
    load: "bodyweight",
    howTo: [
      "Hang from the BATCA bar, hands slightly wider than shoulders, palms away.",
      "Pull until your chin clears the bar, then lower all the way to a dead hang.",
      "Too hard? Loop the red band over the bar and put a foot or knee in it. Too easy? Add a plate with the dip belt.",
    ],
    cues: ["Start each rep by pulling the shoulder blades down", "Full hang at the bottom"],
  },
  {
    id: "lat_pulldown",
    media: "Full_Range-Of-Motion_Lat_Pulldown",
    name: "Lat pulldown (SportsArt)",
    pattern: "vpull",
    equipment: ["lat_row_press"],
    muscles: ["lats", "biceps"],
    load: "stack",
    howTo: [
      "Sit with thighs under the pads, grab the overhead bar wider than shoulders.",
      "Lean back slightly, pull the bar to your upper chest, squeezing the lats.",
      "Return under control until arms are straight.",
    ],
    cues: ["Pull the elbows down to your pockets", "Don't swing your torso"],
  },
  {
    id: "cable_straight_arm_pulldown",
    media: "Rope_Straight-Arm_Pulldown",
    name: "Cable straight-arm pulldown",
    pattern: "vpull",
    equipment: ["cable"],
    muscles: ["lats"],
    load: "stack",
    howTo: [
      "High pulley with the rope. Step back, hinge slightly, arms almost straight overhead.",
      "Sweep the rope down to your thighs in an arc, keeping the arms straight. Return slowly.",
    ],
    cues: ["Feel it in the lats, not the triceps", "Lighter weight, slow tempo"],
  },

  // ---- Core -----------------------------------------------------------------------
  {
    id: "cable_crunch",
    media: "Cable_Crunch",
    name: "Cable crunch (rope)",
    pattern: "core",
    equipment: ["cable", "mat"],
    muscles: ["abs"],
    load: "stack",
    howTo: [
      "High pulley with the rope. Kneel facing it, rope held at the sides of your head.",
      "Crunch down, bringing your elbows toward your knees by rounding your spine.",
      "Return until you feel a stretch in the abs.",
    ],
    cues: ["Hips stay still; this isn't a hip hinge", "Exhale hard at the bottom"],
  },
  {
    id: "decline_situp",
    media: "Decline_Crunch",
    name: "Decline bench sit-up",
    pattern: "core",
    equipment: ["bench_decline"],
    muscles: ["abs", "hip flexors"],
    load: "bodyweight",
    howTo: [
      "Hook your feet under the rollers, lie back on the decline bench.",
      "Curl up one vertebra at a time until your chest is near your thighs. Lower slowly.",
      "Hold a plate or dumbbell on your chest to progress.",
    ],
    cues: ["Lower in 3 seconds", "Don't yank with your neck"],
  },
  {
    id: "ball_crunch",
    media: "Exercise_Ball_Crunch",
    name: "Stability ball crunch",
    pattern: "core",
    equipment: ["stability_ball"],
    muscles: ["abs"],
    load: "bodyweight",
    howTo: [
      "Sit on the ball, walk your feet forward until your lower back is on it.",
      "Hands behind your head, crunch up 30–45°, then let your back extend over the ball.",
    ],
    cues: ["Use the full range the ball gives you", "Feet wide for balance"],
  },
  {
    id: "hanging_knee_raise",
    media: "Hanging_Leg_Raise",
    name: "Hanging knee raise",
    pattern: "core",
    equipment: ["pullup_bar"],
    muscles: ["abs", "hip flexors"],
    load: "bodyweight",
    howTo: [
      "Hang from the pull-up bar. Pull your knees up to your chest, tilting the pelvis up at the top.",
      "Lower slowly without swinging.",
    ],
    cues: ["Round your lower back at the top", "Stop and reset if you start swinging"],
  },
  {
    id: "plank",
    media: "Plank",
    name: "Plank",
    pattern: "core",
    equipment: ["mat"],
    muscles: ["abs", "core"],
    load: "time",
    timed: true,
    howTo: [
      "Forearms on the mat, elbows under shoulders, body straight from head to heels.",
      "Squeeze glutes and abs, breathe. Hold for time.",
    ],
    cues: ["Tuck your tailbone slightly", "Hips level with shoulders"],
  },
  {
    id: "dead_bug",
    media: "Dead_Bug",
    name: "Dead bug",
    pattern: "core",
    equipment: ["mat"],
    muscles: ["deep core"],
    load: "bodyweight",
    unilateral: true,
    howTo: [
      "Lie on your back, arms straight up, knees bent 90° over hips.",
      "Lower your right arm and left leg toward the floor while pressing your lower back into the mat.",
      "Return and switch sides.",
    ],
    cues: ["Lower back never leaves the floor", "Exhale as the limbs go out"],
  },
  {
    id: "side_plank",
    media: "Side_Bridge",
    name: "Side plank",
    pattern: "core",
    equipment: ["mat"],
    muscles: ["obliques"],
    load: "time",
    timed: true,
    unilateral: true,
    howTo: [
      "Lie on your side, forearm under your shoulder, feet stacked.",
      "Lift your hips so your body is a straight line. Hold, then switch sides.",
    ],
    cues: ["Push the floor away with your forearm", "Hips forward, not sagging back"],
  },
  {
    id: "pallof_press",
    media: "Pallof_Press",
    name: "Pallof press",
    pattern: "core",
    equipment: ["cable"],
    muscles: ["obliques", "deep core"],
    load: "stack",
    unilateral: true,
    howTo: [
      "Pulley at chest height with a single handle. Stand sideways to it, handle at your sternum with both hands.",
      "Press your hands straight out in front of you and hold 2 seconds; the cable will try to twist you. Bring back. Switch sides.",
    ],
    cues: ["Feet shoulder width, knees soft", "Don't let your hips rotate"],
  },

  // ---- Arms -------------------------------------------------------------------------
  {
    id: "ez_bar_curl",
    media: "EZ-Bar_Curl",
    name: "EZ-bar curl",
    pattern: "arms",
    equipment: ["ez_bar", "plates"],
    muscles: ["biceps"],
    load: "plate",
    howTo: [
      "Grip the EZ bar on the angled parts, palms up, hands shoulder width.",
      "Curl to the shoulders keeping elbows pinned at your sides. Lower in 2–3 seconds.",
    ],
    cues: ["No swinging from the hips", "Full extension at the bottom"],
  },
  {
    id: "db_hammer_curl",
    media: "Hammer_Curls",
    name: "Hammer curl",
    pattern: "arms",
    equipment: ["dumbbells"],
    muscles: ["biceps", "forearms"],
    load: "dumbbell",
    howTo: ["Dumbbells at your sides, palms facing in.", "Curl to the shoulder with the thumb up. Lower slowly."],
    cues: ["Elbows stay at your sides", "Alternate arms if you need to"],
  },
  {
    id: "rope_pushdown",
    media: "Triceps_Pushdown_-_Rope_Attachment",
    name: "Rope triceps pushdown",
    pattern: "arms",
    equipment: ["cable"],
    muscles: ["triceps"],
    load: "stack",
    howTo: [
      "High pulley with the rope. Elbows pinned at your sides, hands at chest height.",
      "Push down until arms are straight, splitting the rope apart at the bottom. Return to chest height.",
    ],
    cues: ["Only the forearms move", "Lean slightly forward"],
  },
  {
    id: "ez_skull_crusher",
    media: "EZ-Bar_Skullcrusher",
    name: "EZ-bar skull crusher",
    pattern: "arms",
    equipment: ["ez_bar", "plates", "bench_adjustable"],
    muscles: ["triceps"],
    load: "plate",
    howTo: [
      "Lie on the flat bench holding the EZ bar over your chest, arms straight.",
      "Bend only at the elbows, lowering the bar to just behind your forehead. Extend back up.",
    ],
    cues: ["Upper arms stay still, angled slightly back", "Go light; this one stresses the elbows"],
  },
  {
    id: "db_overhead_triceps",
    media: "Overhead_Triceps",
    name: "Overhead dumbbell triceps extension",
    pattern: "arms",
    equipment: ["dumbbells"],
    muscles: ["triceps"],
    load: "dumbbell",
    howTo: [
      "Hold one dumbbell overhead with both hands under the top head.",
      "Lower it behind your head by bending the elbows, then extend back up.",
    ],
    cues: ["Elbows point forward, not out", "Ribs down"],
  },

  // ---- Shoulder isolation -----------------------------------------------------------
  {
    id: "db_lateral_raise",
    media: "Side_Lateral_Raise",
    name: "Dumbbell lateral raise",
    pattern: "shoulders_iso",
    equipment: ["dumbbells"],
    muscles: ["side delts"],
    load: "dumbbell",
    howTo: ["Light dumbbells at your sides.", "Raise them out to shoulder height with a slight elbow bend, pinkies slightly up. Lower slowly."],
    cues: ["Lead with the elbows", "Stop at shoulder height"],
  },
  {
    id: "cable_lateral_raise",
    media: "Cable_Seated_Lateral_Raise",
    name: "Cable lateral raise",
    pattern: "shoulders_iso",
    equipment: ["cable"],
    muscles: ["side delts"],
    load: "stack",
    unilateral: true,
    howTo: [
      "Low pulley with a single handle. Stand sideways, grab it with the far hand across your body.",
      "Raise your arm out to the side to shoulder height. Lower slowly. Switch sides.",
    ],
    cues: ["Constant tension — don't rest at the bottom", "Light weight, high reps"],
  },
  {
    id: "cable_face_pull",
    media: "Face_Pull",
    name: "Cable face pull",
    pattern: "shoulders_iso",
    equipment: ["cable"],
    muscles: ["rear delts", "upper back"],
    load: "stack",
    howTo: [
      "Pulley at face height with the rope. Grab it with thumbs toward you.",
      "Pull the rope to your face, splitting your hands apart so your knuckles end up by your ears.",
      "Squeeze your shoulder blades, then return slowly.",
    ],
    cues: ["Elbows high and wide", "Think 'show off your biceps' at the end"],
  },
  {
    id: "db_rear_delt_fly",
    media: "Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench",
    name: "Incline rear delt fly",
    pattern: "shoulders_iso",
    equipment: ["dumbbells", "bench_adjustable"],
    muscles: ["rear delts"],
    load: "dumbbell",
    howTo: [
      "Lie face down on the 30° bench with light dumbbells hanging.",
      "Raise the arms out to the sides to shoulder height, slight elbow bend. Lower slowly.",
    ],
    cues: ["Thumbs down or neutral", "Tiny weights; it's a small muscle"],
  },

  // ---- Leg isolation ---------------------------------------------------------------------
  {
    id: "leg_extension",
    media: "Leg_Extensions",
    name: "Leg extension (SportsArt)",
    pattern: "legs_iso",
    equipment: ["leg_ext_curl"],
    muscles: ["quads"],
    load: "stack",
    howTo: [
      "Set the roller pad on your shins just above the ankles, knees in line with the machine's pivot.",
      "Extend until legs are straight, pause one second, lower slowly.",
    ],
    cues: ["Toes pointed up", "Don't let the stack slam"],
  },
  {
    id: "leg_curl",
    media: "Seated_Leg_Curl",
    name: "Seated leg curl (SportsArt)",
    pattern: "legs_iso",
    equipment: ["leg_ext_curl"],
    muscles: ["hamstrings"],
    load: "stack",
    howTo: [
      "Flip the machine to curl mode per the sticker. Pad on your lower calves, thigh pad locked down.",
      "Curl your heels under the seat as far as you can, pause, return slowly.",
    ],
    cues: ["Keep your hips down in the seat", "Slow negative"],
  },
  {
    id: "cable_kickback",
    media: "Glute_Kickback",
    name: "Cable glute kickback",
    pattern: "legs_iso",
    equipment: ["cable"],
    muscles: ["glutes"],
    load: "stack",
    unilateral: true,
    howTo: [
      "Low pulley with the ankle strap. Face the machine, hold the frame, hinge slightly.",
      "Kick the strapped leg straight back, squeezing the glute. Return slowly. Switch legs.",
    ],
    cues: ["Don't arch your back to go higher", "Squeeze at the end for a second"],
  },
  {
    id: "db_calf_raise",
    media: "Calf_Raise_On_A_Dumbbell",
    name: "Dumbbell calf raise",
    pattern: "legs_iso",
    equipment: ["dumbbells", "plates"],
    muscles: ["calves"],
    load: "dumbbell",
    howTo: ["Stand on a 45 lb plate with the balls of your feet, dumbbells in hand.", "Rise onto your toes, pause, lower until you feel a stretch."],
    cues: ["Full stretch at the bottom", "Two seconds up, two down"],
  },

  // ---- Conditioning ------------------------------------------------------------------------
  {
    id: "slam_ball_slams",
    media: "One-Arm_Medicine_Ball_Slam",
    name: "Slam ball slams",
    pattern: "conditioning",
    equipment: ["slam_ball"],
    muscles: ["full body"],
    load: "bodyweight",
    howTo: [
      "Hold the slam ball overhead, up on your toes.",
      "Slam it into the floor as hard as you can, squatting down to catch it on the bounce. Repeat.",
    ],
    cues: ["Use your whole body", "Catch low, don't bend over to pick it up"],
  },
  {
    id: "kb_swing_intervals",
    media: "One-Arm_Kettlebell_Swings",
    name: "Kettlebell swing intervals",
    pattern: "conditioning",
    equipment: ["kettlebells"],
    muscles: ["glutes", "hamstrings", "heart"],
    load: "time",
    timed: true,
    howTo: ["20 seconds of swings, 40 seconds rest. Repeat for the listed time.", "Same form as the kettlebell swing."],
    cues: ["Hinge, snap, float", "Pick a bell you can swing crisply when tired"],
  },
  {
    id: "bike_intervals",
    media: "Bicycling_Stationary",
    name: "Bike intervals",
    pattern: "conditioning",
    equipment: ["bike"],
    muscles: ["heart", "legs"],
    load: "time",
    timed: true,
    howTo: ["30 seconds hard, 90 seconds easy. Repeat for the listed time.", "Hard means you couldn't talk; easy means you could."],
    cues: ["Cadence up, resistance up on the hard bits", "Stay seated"],
  },
  {
    id: "farmer_carry",
    media: "Farmers_Walk",
    name: "Farmer carry",
    pattern: "conditioning",
    equipment: ["dumbbells"],
    muscles: ["grip", "core", "traps"],
    load: "dumbbell",
    timed: true,
    howTo: ["Heavy dumbbell in each hand.", "Walk tall, laps across the gym floor, for the listed time."],
    cues: ["Shoulders back, don't shrug", "Short quick steps"],
  },
  {
    id: "med_ball_wall_ball",
    name: "Medicine ball squat-to-press",
    pattern: "conditioning",
    equipment: ["med_balls"],
    muscles: ["full body"],
    load: "bodyweight",
    howTo: ["Hold a medicine ball at your chest. Squat, then stand and press it overhead in one motion.", "Lower it back to your chest as you squat again."],
    cues: ["Drive from the legs into the press", "Breathe out on the press"],
  },

  // ---- Cardio (steady) -----------------------------------------------------------------------
  {
    id: "incline_walk",
    media: "Walking_Treadmill",
    name: "Incline treadmill walk",
    pattern: "cardio",
    equipment: ["treadmill"],
    muscles: ["heart", "glutes", "calves"],
    load: "time",
    timed: true,
    howTo: ["Set the incline to 10–12% and speed to 3–3.5 mph.", "Walk for the listed time without holding the rails."],
    cues: ["You should be able to talk in short sentences", "Hands off the rails"],
  },
  {
    id: "steady_bike",
    media: "Bicycling_Stationary",
    name: "Steady bike",
    pattern: "cardio",
    equipment: ["bike"],
    muscles: ["heart", "legs"],
    load: "time",
    timed: true,
    howTo: ["Moderate resistance, cadence around 80–90 rpm.", "Ride for the listed time at a conversational pace."],
    cues: ["Seat height: slight knee bend at the bottom of the pedal stroke"],
  },
  {
    id: "steady_elliptical",
    media: "Elliptical_Trainer",
    name: "Steady elliptical",
    pattern: "cardio",
    equipment: ["elliptical"],
    muscles: ["heart", "full body"],
    load: "time",
    timed: true,
    howTo: ["Moderate resistance. Use the moving handles.", "Keep a steady pace for the listed time."],
    cues: ["Stand tall; don't lean on the console"],
  },

  // ---- Mobility -----------------------------------------------------------------------------------
  {
    id: "mobility_flow",
    name: "Mobility flow",
    pattern: "mobility",
    equipment: ["mat"],
    muscles: ["hips", "thoracic spine", "hamstrings"],
    load: "time",
    timed: true,
    howTo: [
      "Cat-cow × 10.",
      "World's greatest stretch × 5 per side.",
      "90/90 hip switches × 10.",
      "Couch stretch 45 seconds per side.",
      "Thoracic rotations × 8 per side.",
      "Repeat until the time is up.",
    ],
    cues: ["Slow and breathing", "Nothing should hurt"],
  },
];

export const exerciseById = Object.fromEntries(EXERCISES.map((e) => [e.id, e])) as Record<string, Exercise>;

// Photos from the open free-exercise-db dataset (Unlicense), two frames per exercise.
const MEDIA_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
export function mediaFrames(ex: Exercise): string[] {
  return ex.media ? [`${MEDIA_BASE}/${ex.media}/0.jpg`, `${MEDIA_BASE}/${ex.media}/1.jpg`] : [];
}

export function youtubeSearchUrl(ex: Exercise): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " form")}`;
}
