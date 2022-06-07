// nodemon index.js

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

// MIDDLEWARE
app.use(cors())
app.use(express.json());

// ROUTES
// Insert app_user
app.post("/new/user", async (req, res) => {
    try {
        const { id, name, email, phone_no } = req.body;
        const newUser = await pool.query("INSERT INTO app_user (id, name, email, phone_no) VALUES($1, $2, $3, $4) RETURNING *", [id, name, email, phone_no]);
        res.json(newUser.rows[0]);
        console.log("Successfully Inserted!");
    } catch (err) {
        console.error(err.message);
        console.log("The row was NOT inserted");
        res.json();
    }
});

// Insert resident
app.post("/new/resident", async (req, res) => {
    try {
        const { id, name, email, phone_no, room_no, course, department } = req.body;
        const block_id = room_no.slice(0, 1);
        await pool.query("INSERT INTO app_user (id, name, email, phone_no) VALUES($1, $2, $3, $4)", [id, name, email, phone_no]);
        console.log("Created new user.");
        const newResident = await pool.query("INSERT INTO resident (id, room_no, course, department, block_id) VALUES($1, $2, $3, $4, $5) RETURNING *", [id, room_no, course, department, block_id]);
        console.log("Created new resident.");
        res.json(newResident.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Insert resident tutor
app.post("/new/rt", async (req, res) => {
    try {
        const { id, name, email, phone_no, room_no } = req.body;
        const block_id = room_no.slice(0, 1);
        await pool.query("INSERT INTO app_user (id, name, email, phone_no ) VALUES($1, $2, $3, $4)", [id, name, email, phone_no]);
        console.log("Created new user.");
        const newRT = await pool.query("INSERT INTO resident_tutor (id, room_no) VALUES($1, $2) RETURNING *", [id, room_no]);
        console.log("Created new resident tutor.");
        await pool.query("INSERT INTO block (id, rt_id) VALUES($1, $2)", [block_id, id]);
        console.log("Resident Tutor was added to his block.");
        res.json(newRT.rows[0]);
    }
    catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Insert supervisor
app.post("/new/supervisor", async (req, res) => {
    try {
        const { id, name, email, phone_no, block_id } = req.body;
        await pool.query("INSERT INTO app_user (id, name, email, phone_no ) VALUES($1, $2, $3, $4)", [id, name, email, phone_no]);
        console.log("Created new user.");
        const newSupervisor = await pool.query("INSERT INTO supervisor (id, block_id) VALUES($1, $2) RETURNING *", [id, block_id]);
        console.log("Created new supervisor.");
        res.json(newSupervisor.rows[0]);
    }
    catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Insert office staff
app.post("/new/staff", async (req, res) => {
    try {
        const { id, name, email, phone_no } = req.body;
        await pool.query("INSERT INTO app_user (id, name, email, phone_no ) VALUES($1, $2, $3, $4)", [id, name, email, phone_no]);
        console.log("Created new user.");
        const newStaff = await pool.query("INSERT INTO office_staff (id) VALUES($1, $2) RETURNING *", [id]);
        console.log("Created new supervisor.");
        res.json(newStaff.rows[0]);
    }
    catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Insert event
app.post("/new/event", async (req, res) => {
    try {
        const { id, name, date, time, location, staff_id } = req.body;
        const newEvent = await pool.query("INSERT INTO event (event_id, name, event_date, event_time, location ) VALUES($1, $2, $3, $4, $5) RETURNING *", [id, name, date, time, location]);
        await pool.query("INSERT INTO event_incharge (staff_id, event_id) VALUES($1, $2)", [staff_id, id]);
        res.json(newEvent.rows[0]);
    }
    catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Insert new attendance(date)
app.post("/new/attendance", async (req, res) => {
    try {
        const { date } = req.body;
        const newAttendance = await pool.query("INSERT INTO attendance (date) VALUES($1) RETURNING *", [date]);
        console.log("New date has been successfully added to attendance.");
        res.json(newAttendance.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Insert absentee
app.post("/new/absentee", async (req, res) => {
    try {
        const { id, date } = req.body;
        const newAbsentee = await pool.query("INSERT INTO is_absent (id, date) VALUES($1, $2) RETURNING *", [id, date]);
        console.log("New absentee has been successfully logged.");
        res.json(newAbsentee.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

//INSERT INTO mess VALUES('G', FALSE, '{"Idli", "Sambar", "Chutney"}', '{"Curd Rice", "Pickle"}', '{"Chappathi", "Veg Curry", "Banana"}', '{"Maggi"}', '{"Roti", "Sabji", "Dhal Rice"}', '{"Poori", "Aloo Curry", "Gulab Jamun"}');

// Insert new token
app.post("/new/token", async (req, res) => {
    try {
        const { id, date, mess, owner, non_veg } = req.body;
        const newToken = await pool.query("INSERT INTO token (token_id, valid_date, mess_name, owner_id, is_non_veg) VALUES($1, $2, $3, $4, $5) RETURNING *", [id, date, mess, owner, non_veg]);
        console.log("New token has been logged.");
        res.json(newToken.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

app.listen(5000, () => {
    console.log("Server has started on port 5000");
})