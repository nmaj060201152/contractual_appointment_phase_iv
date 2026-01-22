import { supabase } from "./supabase";

// ================= VACANCY MAP =================

const VacancyMap = {
  "DAAM": { Male: { "Drawing Master": 1 }, Female: { "JAT": 1 } },
  "HASSAN PEER": { Male: { "JVT": 2 }, Female: {} },
  "HUBCO": { Male: { "JVT": 8 }, Female: {} },
  "LOHI": { Male: { "JVT": 1 }, Female: {} },
  "MC DUREJI": { Male: { "JVT": 13, "JET": 2 }, Female: {} },
  "MC GADDANI": { Male: { "Drawing Master": 1, "JVT": 2 }, Female: { "Drawing Master": 1, "JAT": 1, "JET": 1 } },
  "MC HUB": { Male: { "JET Tech": 1, "JVT": 1 }, Female: {} },
  "MC WINDER": { Male: { "Drawing Master": 1, "JET Tech": 1, "JVT": 2 }, Female: {} },
  "PARIYAN": { Male: { "Drawing Master": 2 }, Female: {} },
  "SAKRAN": { Male: {}, Female: { "JVT": 1 } },
  "SONMIANI": { Male: { "Drawing Master": 1 }, Female: {} },
  "UMAID ABAD": { Male: { "Drawing Master": 1 }, Female: {} },
  "VEERAHUB": { Male: { "JVT": 6 }, Female: {} },
  "CHORE": { Male: {}, Female: {} },
  "KHARARI": { Male: {}, Female: {} },
  "LAK ROHAIL": { Male: {}, Female: {} }
};

// ================= COMPONENT =================

export default function AdminDashboard({ isDbOpen, setIsDbOpen, currentPhase, setCurrentPhase }) {


  

  
  // ================= EXPORT CANDIDATES =================

  const exportCandidates = async () => {

  // 1) applications
  const { data: apps } = await supabase
    .from("applications")
    .select("id, candidate_id, post, uc, phase")
    .eq("phase", currentPhase);

  if (!apps || apps.length === 0) {
    alert("No applications found");
    return;
  }

  // 2) candidates
  const ids = apps.map(a => a.candidate_id);

  const { data: cands } = await supabase
    .from("candidates")
    .select("*")
    .in("id", ids);

  if (!cands || cands.length === 0) {
    alert("No candidates found");
    return;
  }

  // 3) merge
  const rows = apps.map(app => {
    const c = cands.find(x => x.id === app.candidate_id);
    if (!c) return null;

    return {
      Name: c.name,
      Father_Husband:
        c.gender === "Female" ? c.husband_name : c.father_name,
      CNIC: c.cnic,
      Gender: c.gender,
      Phone: c.cell_no,
      DOB: c.dob,
      UC: app.uc,
      Post: app.post,
      Phase: app.phase
    };
  }).filter(Boolean);

  downloadExcel(rows, "All_Candidates");
};


  // ================= EXPORT APPLICATIONS =================

  const exportApplications = async () => {

  // 1) applications
  const { data: apps } = await supabase
    .from("applications")
    .select("id, candidate_id, post, uc, professional, phase")
    .eq("phase", currentPhase);

  if (!apps || apps.length === 0) {
    alert("No applications found");
    return;
  }

  const ids = apps.map(a => a.candidate_id);

  // 2) candidates
  const { data: cands } = await supabase
    .from("candidates")
    .select("*")
    .in("id", ids);

  // 3) academics
  const { data: acads } = await supabase
    .from("academics")
    .select("*")
    .in("candidate_id", ids);

  if (!cands || !acads) {
    alert("Data missing");
    return;
  }

  // 4) merge + aggregate
  const rows = apps.map(app => {
    const c = cands.find(x => x.id === app.candidate_id);
    const a = acads.find(x => x.candidate_id === app.candidate_id);
    if (!c || !a) return null;

    const m = (a.matric_obtained / a.matric_total) * 100;
    const i = (a.inter_obtained / a.inter_total) * 100;
    const b = (a.bachelor_obtained / a.bachelor_total) * 100;
    const aggregate = (m * 0.33 + i * 0.33 + b * 0.34).toFixed(2);

    return {
      Receipt_No: app.id,
      Name: c.name,
      CNIC: c.cnic,
      Gender: c.gender,
      UC: app.uc,
      Post: app.post,
      Matric: `${a.matric_obtained}/${a.matric_total}`,
      Inter: `${a.inter_obtained}/${a.inter_total}`,
      Bachelor: `${a.bachelor_obtained}/${a.bachelor_total}`,
      Aggregate: aggregate,
      Professional: app.professional ? "Yes" : "No",
      Phase: app.phase
    };
  }).filter(Boolean);

  downloadExcel(rows, "All_Applications");
};

  // ================= FINAL MERIT ENGINE =================

  const generateMeritList = async () => {

  // 1️⃣ Load all applications for current phase
  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .eq("phase", currentPhase);

  if (error || !applications || applications.length === 0) {
    alert("No applications found for this phase");
    return;
  }

  let prepared = [];

  // 2️⃣ Process one application at a time
  for (const app of applications) {

    // candidate
    const { data: cand } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", app.candidate_id)
      .single();

    if (!cand) continue;

    // academics
    const { data: acad } = await supabase
      .from("academics")
      .select("*")
      .eq("candidate_id", app.candidate_id)
      .single();

    if (!acad) continue;

    // aggregate
    const m = (acad.matric_obtained / acad.matric_total) * 100;
    const i = (acad.inter_obtained / acad.inter_total) * 100;
    const b = (acad.bachelor_obtained / acad.bachelor_total) * 100;

    const aggregate = parseFloat((m * 0.33 + i * 0.33 + b * 0.34).toFixed(2));

    // final merged row
    prepared.push({
      receipt_no: app.id,
      name: cand.name,
      father_name:
        cand.gender === "Female" ? cand.husband_name : cand.father_name,
      cnic: cand.cnic,
      gender: cand.gender,
      uc: app.uc,
      post: app.post,
      professional: app.professional,
      aggregate
    });
  }

  if (prepared.length === 0) {
    alert("No valid records prepared");
    return;
  }

  // 3️⃣ Vacancy-based merit logic
  let finalMerit = [];

  for (const uc in VacancyMap) {
    for (const gender in VacancyMap[uc]) {
      for (const post in VacancyMap[uc][gender]) {

        const vacancies = VacancyMap[uc][gender][post];
        if (vacancies <= 0) continue;

        const pool = prepared
          .filter(c =>
            c.uc === uc &&
            c.gender === gender &&
            c.post === post
          )
          .sort((a, b) => b.aggregate - a.aggregate);

        finalMerit.push(
          ...pool.slice(0, vacancies).map(c => ({
            ...c,
            remarks: "SELECTED"
          }))
        );
      }
    }
  }

  if (finalMerit.length === 0) {
    alert("No candidates selected as per vacancy rules");
    return;
  }

  // 4️⃣ Export CSV
  const rows = finalMerit.map((c, i) => ({
    S_No: i + 1,
    Post: c.post,
    Name: c.name,
    Father_Husband: c.father_name,
    CNIC: c.cnic,
    Gender: c.gender,
    UC: c.uc,
    Aggregate: c.aggregate,
    Professional: c.professional ? "Yes" : "No",
    Remarks: c.remarks
  }));

  downloadExcel(rows, `Final_Merit_List_${currentPhase}`);
  alert("Final Merit List Generated Successfully");
};



  // ================= UI =================

  return (
    <div style={{ padding: 20 }}>

      <p>
        Current Phase:
        <select
          value={currentPhase}
          onChange={(e) => setCurrentPhase(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="testing">Testing</option>
          <option value="real">Real Data</option>
        </select>
      </p>

      <p>
        Database Status:
        <b style={{ color: isDbOpen ? "green" : "red" }}>
          {isDbOpen ? " OPEN" : " CLOSED"}
        </b>
      </p>

      <button onClick={() => setIsDbOpen(!isDbOpen)}>
        {isDbOpen ? "Close Database" : "Open Database"}
      </button>

      <br/><br/>

      <h2>DEO Hub Recruitment – Admin Dashboard</h2>

      <button onClick={exportCandidates}>
        Export All Candidates
      </button>

      <br/><br/>

      <button onClick={exportApplications}>
        Export All Applications
      </button>

      <br/><br/>

      <button onClick={generateMeritList}>
        Generate Final Merit List
      </button>

      <br/><br/>


      

      <button onClick={() => window.location.reload()}>
        Logout Admin
      </button>

    </div>
  );
}

// ================= EXCEL GENERATOR =================

const downloadExcel = (rows, filename) => {
  if (!rows || rows.length === 0) {
    alert("No data found");
    return;
  }

  const headers = Object.keys(rows[0]).join(",");
  const body = rows.map(r => Object.values(r).join(",")).join("\n");

  const csv = headers + "\n" + body;

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}
