import "./App.css";

import AdminDashboard from "./AdminDashboard";

import { useState, useEffect } from "react";

import { supabase } from "./supabase";

export default function App() {
  const [form, setForm] = useState({
    cnic: "",
    name: "",
    father_name: "",
    husband_name: "",
    unmarried: false,
    gender: "",
    cell_no: "",
    dob: "",
    matric_obtained: "",
    matric_total: "",
    inter_obtained: "",
    inter_total: "",
    bachelor_obtained: "",
    bachelor_total: "",
    professional: "Yes",
    post: "",
    uc: "",
    professional_degree: "",

  });

const [isAdmin, setIsAdmin] = useState(false);
const [adminPass, setAdminPass] = useState("");
const [phoneError, setPhoneError] = useState("");
const [matricError, setMatricError] = useState("");
const [interError, setInterError] = useState("");
const [bachelorError, setBachelorError] = useState("");
const [cnicError, setCnicError] = useState("");



const [currentPhase, setCurrentPhase] = useState(
  localStorage.getItem("currentPhase") || "testing"
);

const [isDbOpen, setIsDbOpen] = useState(
  localStorage.getItem("isDbOpen") === "true"
);

useEffect(() => {
  localStorage.setItem("currentPhase", currentPhase);
}, [currentPhase]);

useEffect(() => {
  localStorage.setItem("isDbOpen", isDbOpen);
}, [isDbOpen]);

const downloadReceipt = async () => {
  if (!form.search_cnic || !form.search_dob) {
    alert("Please enter CNIC and Date of Birth");
    return;
  }

  // Step 1: Find candidate
  const { data: cand } = await supabase
    .from("candidates")
    .select("id, name, father_name, husband_name, gender, cnic, dob, cell_no")
    .eq("cnic", form.search_cnic)
    .eq("dob", form.search_dob)
    .single();

  if (!cand) {
    alert("No candidate found with this CNIC and Date of Birth");
    return;
  }

  // Step 2: Find his latest application
  const { data: app } = await supabase
    .from("applications")
    .select("id, post, uc")
    .eq("candidate_id", cand.id)
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (!app) {
    alert("No application found for this candidate");
    return;
  }

  // Step 3: Generate slip (use application id as receipt no)
  const slipText = `
===============================
      DEO HUB RECRUITMENT
===============================

Receipt No: ${app.id}

Name: ${cand.name}
Father / Husband: ${cand.gender === "Female" ? cand.husband_name : cand.father_name}
CNIC: ${cand.cnic}
Phone: ${cand.cell_no}
Gender: ${cand.gender}
Date of Birth: ${cand.dob}

Union Council: ${app.uc}
Post Applied: ${app.post}

--------------------------------
Please attach this slip with your
documents at the time of submission.
--------------------------------
`;

  const receiptWindow = window.open("", "_blank");

receiptWindow.document.write(`
<html>
<head>
  <title>Receipt ${app.id}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 30px;
    }
    .box {
      border: 2px solid #000;
      padding: 20px;
      max-width: 600px;
      margin: auto;
    }
    h2 {
      text-align: center;
      margin-bottom: 20px;
    }
    p {
      margin: 6px 0;
      font-size: 14px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="box">
    <h2>DEO HUB RECRUITMENT</h2>

    <p><b>Receipt No:</b> ${app.id}</p>
    <p><b>Name:</b> ${cand.name}</p>
    <p><b>Father / Husband:</b> ${
      cand.gender === "Female" ? cand.husband_name : cand.father_name
    }</p>
    <p><b>CNIC:</b> ${cand.cnic}</p>
    <p><b>Phone:</b> ${cand.cell_no}</p>
    <p><b>Gender:</b> ${cand.gender}</p>
    <p><b>Date of Birth:</b> ${cand.dob}</p>

    <hr/>

    <p><b>Union Council:</b> ${app.uc}</p>
    <p><b>Post Applied:</b> ${app.post}</p>

    <div class="footer">
      Please attach this slip with documents.
    </div>
  </div>

  <script>
    window.print();
  </script>
</body>
</html>
`);

receiptWindow.document.close();

};




  const isDeadlinePassed = () => {
  const now = new Date();
  const deadline = new Date("2026-01-29T23:59:00");
  return now > deadline;
};

  const onlyText = (v) => v.replace(/[^a-zA-Z\s]/g, "");


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onlyNumber = (v) => v.replace(/\D/g, "");

const ProfessionalMap = {
  "JET": ["BA (Hons) Education", "BS Education", "B.Ed"],
  "JET Tech": ["One Year Diploma (Agro Tech)"],
  "JAT": ["ATTC"],
  "Drawing Master": ["Drawing Certificate"],
  "JVT": ["PTC", "B.Ed", "ADE", "BA (Hons) Education"],
  "MQ": []   // MQ ke liye professional mandatory nahi
};

// MASTER UC LIST (ALL UCs)
const AllUCs = [
  "DAAM",
  "HASSAN PEER",
  "HUBCO",
  "LOHI",
  "MC DUREJI",
  "MC GADDANI",
  "MC HUB",
  "MC WINDER",
  "PARIYAN",
  "SAKRAN",
  "SONMIANI",
  "UMAID ABAD",
  "VEERAHUB",
  "CHORE",
  "KHARARI",
  "LAK ROHAIL"
];

// MASTER POST LIST (ALL POSTS)
const AllPosts = [
  "Drawing Master",
  "JAT",
  "JET",
  "JET Tech",
  "JVT",
  "EST",
  "PET",
  "ECE",
  "MQ"
];

const VacancyMap = {
  "DAAM": {
    Male: { "Drawing Master": 1 },
    Female: { "JAT": 1 }
  },

  "HASSAN PEER": {
    Male: { "JVT": 2 },
    Female: {}
  },

  "HUBCO": {
    Male: { "JVT": 8 },
    Female: {}
  },

  "LOHI": {
    Male: { "JVT": 1 },
    Female: {}
  },

  "MC DUREJI": {
    Male: { "JVT": 13 , "JET": 2 },
    Female: {}
  },

  "MC GADDANI": {
    Male: { "Drawing Master": 1 , "JVT": 2 },
    Female: { "Drawing Master": 1, "JAT": 1 , "JET": 1 }
  },

"MC HUB": {
  Male: {
    "JET Tech": 1,
    "JVT": 1
  },
  Female: {}
},

"MC WINDER": {
  Male: {
    "Drawing Master": 1,
    "JET Tech": 1,
    "JVT": 2
  },
  Female: {}
},

  "PARIYAN": {
    Male: { "Drawing Master": 2 },
    Female: {}
  },

  "SAKRAN": {
    Male: {},
    Female: { "JVT": 1 }
  },

  "SONMIANI": {
    Male: { "Drawing Master": 1 },
    Female: {}
  },

  "UMAID ABAD": {
    Male: { "Drawing Master": 1 },
    Female: {}
  },

  "VEERAHUB": {
    Male: { "JVT": 6 },
    Female: {}
  },

  // NEW UCs (ZERO VACANCY FOR NOW)
  "CHORE": { Male: {}, Female: {} },
  "KHARARI": { Male: {}, Female: {} },
  "LAK ROHAIL": { Male: {}, Female: {} }
};
const getAvailablePosts = () => {
  if (!form.uc || !form.gender) return [];

  const ucData = VacancyMap[form.uc];
  if (!ucData) return [];

  const genderData = ucData[form.gender];
  if (!genderData) return [];

  return Object.keys(genderData).filter(
    (post) => genderData[post] > 0
  );
};




  const calculateAggregate = () => {
    const m = (form.matric_obtained / form.matric_total) * 100;
    const i = (form.inter_obtained / form.inter_total) * 100;
    const b = (form.bachelor_obtained / form.bachelor_total) * 100;
    return (m * 0.33 + i * 0.33 + b * 0.34).toFixed(2);
  };

  const isOverAge = () => {
  const dob = new Date(form.dob);
  const ref = new Date("2026-02-01");

  let age = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) {
    age--;
  }

  return age > 55;
};


  const submit = async () => {

if (!isDbOpen) {
  alert("Database is currently closed. Please try later.");
  return;
}


if (isDeadlinePassed()) {
  alert("Time up – Deadline was 29 January 2026. Merit list under process.");
  return;
}


if (isOverAge()) {
  alert("Over Age – Maximum age limit is 55 years as on 1st February 2026");
  return;
}


// Check duplicate CNIC
const { data: existing } = await supabase
  .from("candidates")
  .select("id")
  .eq("cnic", form.cnic);

if (existing.length > 0) {
  alert("This CNIC has already applied. Please download your receipt or apply for more posts.");
  return;
}

if (!["ECE", "MQ"].includes(form.post)) {
  if (form.professional !== "Yes") {
    alert("Professional qualification is mandatory for this post");
    return;
  }

  if (form.professional_degree === "" || form.professional_degree === "Other") {
    alert("Valid professional degree is required for this post");
    return;
  }
}



if (form.cell_no.length !== 11 || !form.cell_no.startsWith("03")) {
  alert("Phone number must be 11 digits and start with 03");
  return;
}


if (form.name.length < 2 || form.name.length > 40) {
  alert("Name must be between 2 and 40 characters");
  return;
}

if (form.father_name.length < 2 || form.father_name.length > 40) {
  alert("Father Name must be between 2 and 40 characters");
  return;
}

if (form.gender === "Female" && form.husband_name.length < 2) {
  alert("Husband Name must be at least 2 characters");
  return;
}

if (form.cnic.length !== 13) {
  alert("CNIC must be exactly 13 digits");
  return;
}




    // Professional mandatory for all except MQ
if (form.post !== "MQ" && form.professional !== "Yes") {
  alert("Professional qualification is mandatory for this post");
  return;
}

if (form.professional === "Yes" && form.professional_degree === "") {
  alert("Please select professional degree");
  return;
}

if (form.professional_degree === "Other") {
  alert("Other degree is not acceptable for eligibility");
  return;
}

    const aggregate = calculateAggregate();

    if (aggregate < 50) {
      alert("Not Eligible – Aggregate below 50%");
      return;
    }

// Save Candidate
const { data: cand, error: err1 } = await supabase
  .from("candidates")
  .insert([{
    cnic: form.cnic,
    name: form.name,
    father_name: form.father_name,
    husband_name: form.gender === "Female" ? form.husband_name : null,
    gender: form.gender,
    cell_no: form.cell_no,
    dob: form.dob
  }])
  .select()
  .single();

if (err1) {
  alert(err1.message);
  return;
}

// Save Academics
await supabase.from("academics").insert([{
  candidate_id: cand.id,
  matric_obtained: form.matric_obtained,
  matric_total: form.matric_total,
  inter_obtained: form.inter_obtained,
  inter_total: form.inter_total,
  bachelor_obtained: form.bachelor_obtained,
  bachelor_total: form.bachelor_total
}]);

// Save Application
await supabase.from("applications").insert([{
  candidate_id: cand.id,
  post: form.post,
  uc: form.uc,
  professional: form.professional === "Yes",
  phase: currentPhase
}]);

if (matricError || interError || bachelorError) {
  alert("Please fix marks errors before submitting");
  return;
}


alert("Application Submitted Successfully");};

if (isAdmin) {
  return (
    <AdminDashboard
      isDbOpen={isDbOpen}
      setIsDbOpen={setIsDbOpen}
      currentPhase={currentPhase}
      setCurrentPhase={setCurrentPhase}
    />
  );
}


  return (






<div className="container">

      <h2>CONTRACTUAL RECRUITMENT (PHASE-IV)</h2>

      <input
  placeholder="CNIC (13 digits)"
  maxLength={13}
  value={form.cnic}
  onChange={(e) => {
    const v = e.target.value.replace(/\D/g, ""); // digits only

    if (v.length <= 13) {
      setForm({ ...form, cnic: v });
    }

    if (v.length === 0) {
      setCnicError("");
    } else if (v.length < 13) {
      setCnicError("CNIC must be exactly 13 digits");
    } else if (v.length === 13) {
      setCnicError("");
    }
  }}
/>
{cnicError && (
  <div style={{ color: "red", fontSize: 12 }}>
    {cnicError}
  </div>
)}

<br/><br/>

      <input placeholder="Name"
  name="name"
  value={form.name}
  onChange={(e) =>
    setForm({ ...form, name: onlyText(e.target.value).slice(0, 40) })
  }
/>
<br/><br/>
      <input
  placeholder="Father Name"
  name="father_name"
  value={form.father_name}
  onChange={(e) =>
    setForm({
      ...form,
      father_name: onlyText(e.target.value).slice(0, 40)
    })
  }
/>
<br/><br/>

      <select name="gender" onChange={handleChange}>
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
      </select><br/><br/>

      {form.gender === "Female" && (
  <>
    <label>
      <input
        type="checkbox"
        checked={form.unmarried}
        onChange={(e) =>
          setForm({
            ...form,
            unmarried: e.target.checked,
            husband_name: e.target.checked ? "Unmarried" : ""
          })
        }
      />
      {" "}Unmarried
    </label>

    <br /><br />

    <input
  placeholder="Husband Name"
  name="husband_name"
  value={form.husband_name}
  disabled={form.unmarried}
  onChange={(e) =>
    setForm({
      ...form,
      husband_name: onlyText(e.target.value).slice(0, 40)
    })
  }
/>

  </>
)}

      
      <br/><br/>

<input
  placeholder="03XXXXXXXXX"
  maxLength={11}
  value={form.cell_no}
  onChange={(e) => {
    const v = e.target.value.replace(/\D/g, "");
    if (v.length <= 11) {
      setForm({ ...form, cell_no: v });

      if (v.length === 0) {
        setPhoneError("");
      } else if (!v.startsWith("03")) {
        setPhoneError("Phone number must start with 03");
      } else if (v.length < 11) {
        setPhoneError("Phone number must be exactly 11 digits");
      } else {
        setPhoneError("");
      }
    }
  }}
/>
<br/><br/>
{phoneError && (
  <div style={{ color: "red", fontSize: 12 }}>
    {phoneError}
  </div>
)}



      <input type="date" name="dob" onChange={handleChange} /><br/><br/>

      <h4>Academic Marks</h4>



<input
  placeholder="Matric Obtained"
  value={form.matric_obtained}
  onChange={(e) => {
    const v = onlyNumber(e.target.value);
    setForm({ ...form, matric_obtained: v });

    if (form.matric_total && Number(v) >= Number(form.matric_total)) {
      setMatricError("Matric obtained must be less than total marks");
    } else {
      setMatricError("");
    }
  }}
/>

<input
  placeholder="Matric Total"
  value={form.matric_total}
  onChange={(e) => {
    const v = onlyNumber(e.target.value);
    setForm({ ...form, matric_total: v });

    if (form.matric_obtained && Number(form.matric_obtained) >= Number(v)) {
      setMatricError("Matric obtained must be less than total marks");
    } else {
      setMatricError("");
    }
  }}
/>
{matricError && (
  <div style={{ color: "red", fontSize: 12 }}>
    {matricError}
  </div>
)}

<br/><br/>

<input
  placeholder="Inter Obtained"
  value={form.inter_obtained}
  onChange={(e) => {
    const v = onlyNumber(e.target.value);
    setForm({ ...form, inter_obtained: v });

    if (form.inter_total && Number(v) >= Number(form.inter_total)) {
      setInterError("Inter obtained must be less than total marks");
    } else {
      setInterError("");
    }
  }}
/>

<input
  placeholder="Inter Total"
  value={form.inter_total}
  onChange={(e) => {
    const v = onlyNumber(e.target.value);
    setForm({ ...form, inter_total: v });

    if (form.inter_obtained && Number(form.inter_obtained) >= Number(v)) {
      setInterError("Inter obtained must be less than total marks");
    } else {
      setInterError("");
    }
  }}
/>

{interError && (
  <div style={{ color: "red", fontSize: 12 }}>
    {interError}
  </div>
)}

<br/><br/>

<input
  placeholder="Bachelor Obtained"
  value={form.bachelor_obtained}
  onChange={(e) => {
    const v = onlyNumber(e.target.value);
    setForm({ ...form, bachelor_obtained: v });

    if (form.bachelor_total && Number(v) >= Number(form.bachelor_total)) {
      setBachelorError("Bachelor obtained must be less than total marks");
    } else {
      setBachelorError("");
    }
  }}
/>

<input
  placeholder="Bachelor Total"
  value={form.bachelor_total}
  onChange={(e) => {
    const v = onlyNumber(e.target.value);
    setForm({ ...form, bachelor_total: v });

    if (form.bachelor_obtained && Number(form.bachelor_obtained) >= Number(v)) {
      setBachelorError("Bachelor obtained must be less than total marks");
    } else {
      setBachelorError("");
    }
  }}
/>

{bachelorError && (
  <div style={{ color: "red", fontSize: 12 }}>
    {bachelorError}
  </div>
)}
<br/><br/>

      <h4>Union Council</h4>
<select name="uc" value={form.uc} onChange={handleChange}>
  <option value="">Select Union Council</option>
  {AllUCs.map((uc) => (
    <option key={uc} value={uc}>{uc}</option>
  ))}
</select>
<br/><br/>

<h4>Post</h4>
<select name="post" value={form.post} onChange={handleChange}>
  <option value="">Select Post</option>
  {getAvailablePosts().map((p) => (
    <option key={p} value={p}>{p}</option>
  ))}
</select>
<br/><br/>


<h4>Professional Qualification</h4>
<select name="professional" value={form.professional} onChange={handleChange}>
  <option value="Yes">Yes</option>
  <option value="No">No</option>
</select>
<br/><br/>

{form.professional === "Yes" && (
  <>
    <h4>Professional Degree</h4>
    <select
      name="professional_degree"
      value={form.professional_degree}
      onChange={handleChange}
    >
      <option value="">Select Degree</option>
      {(ProfessionalMap[form.post] || []).map((deg) => (
        <option key={deg} value={deg}>{deg}</option>
      ))}
      <option value="Other">Other</option>
    </select>
    <br/><br/>
  </>
)}


      <button onClick={submit} disabled={isDeadlinePassed()}>
  SUBMIT APPLICATION
</button>

<hr/>
<h3>Download Receipt Slip</h3>

<input
  placeholder="Enter CNIC"
  onChange={(e) => setForm({ ...form, search_cnic: e.target.value.replace(/\D/g, "") })}
/>
<br/><br/>

<input
  type="date"
  onChange={(e) => setForm({ ...form, search_dob: e.target.value })}
/>
<br/><br/>

<button onClick={downloadReceipt}>Download Receipt</button>

<hr/>
<h3>Admin Login</h3>

<input
  type="password"
  placeholder="Enter Admin Password"
  value={adminPass}
  onChange={(e) => setAdminPass(e.target.value)}
/>
<br/><br/>

<button onClick={() => {
  if (adminPass === "0602011525160211317669") {
    setIsAdmin(true);
  } else {
    alert("Invalid Admin Password");
  }
}}>
Login as Admin
</button>

<hr/>
<div className="footer-marquee">
  <div className="marquee-text">
    Developed by <b>Navaid Majeed Sumalani, District Education Office, District Hub</b> — Contact: <b>0332-6817505</b>
  </div>
</div>

    </div>
  );

  
}

