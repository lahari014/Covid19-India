const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDb();

//API 1
app.get("/states/", async (request, response) => {
  const query = `SELECT * FROM state`;
  const data = await db.all(query);
  let list = [];
  for (let i of data) {
    list.push({
      stateId: i.state_id,
      stateName: i.state_name,
      population: i.population,
    });
  }
  response.send(list);
});

//API 2
app.get("/states/:state_id", async (request, response) => {
  const { state_id } = request.params;
  const query = `SELECT * FROM state WHERE state_id=${state_id}`;
  const data = await db.all(query);
  let list = [];
  for (let i of data) {
    list.push({
      stateId: i.state_id,
      stateName: i.state_name,
      population: i.population,
    });
  }
  response.send(list);
});

//API 3
app.post("/districts/", async (request, response) => {
  const details = request.body;
  const { district_name, state_id, cases, cured, active, deaths } = details;
  const query = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths) 
    VALUES('${district_name}','${state_id}','${cases}','${cured}','${active}','${deaths}')`;
  await db.run(query);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:district_id", async (request, response) => {
  const { district_id } = request.params;
  const query = `SELECT * FROM district WHERE district_id=${district_id}`;
  const i = await db.get(query);
  const list = {
    districtId: i.district_id,
    districtName: i.district_name,
    stateId: i.state_id,
    cases: i.cases,
    cured: i.cured,
    active: i.active,
    deaths: i.deaths,
  };
  response.send(list);
});

//API 5
app.delete("/districts/:district_id/", async (request, response) => {
  const { district_id } = request.params;
  const query = `DELETE FROM district WHERE district_id=${district_id}`;
  await db.run(query);
  response.send("District Removed");
});

//API 6
app.put("/districts/:district_id/", async (request, response) => {
  const { district_id } = request.params;
  const details = request.body;
  const { district_name, state_id, curved, cases, active, deaths } = details;
  const query = `UPDATE district SET
  district_name='${district_name}',
  state_id= '${state_id}',
  cases= '${cases}',
  cured= '${curved}',
  active= '${active}',
  deaths= '${deaths}'  
  WHERE district_id=${district_id}`;
  await db.run(query);
  response.send("District Details Updated");
});
module.exports = app;

//API 7
app.get("/states/:state_id/stats/", async (request, response) => {
  const { state_id } = request.params;
  const query = `
    SELECT
    SUM(cases),
    SUM(cured),
    SUM(active),
    SUM(deaths)
    FROM district 
    WHERE state_id=${state_id}`;
  const data = await db.get(query);
  response.send({
    totalCases: data["SUM(cases)"],
    totalCured: data[" SUM(cured)"],
    totalActive: data["SUM(active)"],
    totalDeaths: data["SUM(deaths)"],
  });
});

//API 8
app.get("/districts/:district_id/details/", async (request, response) => {
  const { district_id } = request.params;
  const query = `
    SELECT state_id
    FROM district
    WHERE district_id=${district_id}`;
  console.log(query);
  const data = await db.all(query);
  const stateId = data[0].state_id;
  console.log(stateId);
  const query1 = `
  SELECT state_name AS stateName
  FROM state WHERE state_id=${stateId}`;
  const data1 = await db.get(query1);
  response.send(data1);
});
