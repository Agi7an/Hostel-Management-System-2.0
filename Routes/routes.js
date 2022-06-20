const { application } = require('express');
const express = require('express');
const router = express.Router();
const pool = require("../Database/db");

// ROUTES
// Insert app_user
router.post("/new/user", async (req, res) => {
    try {
        const { id, name, email, phone_no, password } = req.body;
        const newUser = await pool.query("INSERT INTO app_user (id, name, email, phone_no) VALUES($1, $2, $3, $4, $5) RETURNING *", [id, name, email, phone_no, password]);
        res.json(newUser.rows[0]);
        console.log("Successfully Inserted!");
    } catch (err) {
        console.error(err.message);
        console.log("The row was NOT inserted");
        res.json();
    }
});

// Insert resident
router.post("/new/resident", async (req, res) => {
    try {
        const { id, name, email, phone_no, room_no, course, department, password } = req.body;
        const block_id = room_no.slice(0, 1);
        await pool.query("INSERT INTO app_user (id, name, email, phone_no, password) VALUES($1, $2, $3, $4, $5)", [id, name, email, phone_no, password]);
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
router.post("/new/rt", async (req, res) => {
    try {
        const { id, name, email, phone_no, room_no, password } = req.body;
        const block_id = room_no.slice(0, 1);
        await pool.query("INSERT INTO app_user (id, name, email, phone_no ) VALUES($1, $2, $3, $4, $5)", [id, name, email, phone_no, password]);
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
router.post("/new/supervisor", async (req, res) => {
    try {
        const { id, name, email, phone_no, block_id, password } = req.body;
        await pool.query("INSERT INTO app_user (id, name, email, phone_no ) VALUES($1, $2, $3, $4, $5)", [id, name, email, phone_no, password]);
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
router.post("/new/staff", async (req, res) => {
    try {
        const { id, name, email, phone_no, password } = req.body;
        await pool.query("INSERT INTO app_user (id, name, email, phone_no ) VALUES($1, $2, $3, $4, $5)", [id, name, email, phone_no, password]);
        console.log("Created new user.");
        const newStaff = await pool.query("INSERT INTO office_staff (id) VALUES($1) RETURNING *", [id]);
        console.log("Created new supervisor.");
        res.json(newStaff.rows[0]);
    }
    catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Insert event
router.post("/new/event", async (req, res) => {
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
router.post("/new/attendance", async (req, res) => {
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
router.post("/new/absentee", async (req, res) => {
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

//INSERT INTO mess VALUES('G', FALSE, '{"Idli", "Sambar", "Chutney"}', '{"Curd Rice", "Pickle"}', '{"Chrouterathi", "Veg Curry", "Banana"}', '{"Maggi"}', '{"Roti", "Sabji", "Dhal Rice"}', '{"Poori", "Aloo Curry", "Gulab Jamun"}');

// Insert new token
router.post("/new/token", async (req, res) => {
    try {
        const { id, date, owner, non_veg } = req.body;
        const mess_query = await pool.query("SELECT mess_id FROM block WHERE id = (SELECT block_id FROM resident WHERE id = $1)", [owner]);
        const mess_name = mess_query.rows[0].mess_id;

        if (id === 'undefined') {
            const newToken = await pool.query("INSERT INTO token (token_id, valid_date, mess_name, owner_id, is_non_veg) VALUES($1, $2, $3, $4, $5) RETURNING *", [id, date, mess_name, owner, non_veg]);
            console.log("New token has been logged.");
            res.json(newToken.rows[0]);
        }
        else {
            const newToken = await pool.query("INSERT INTO token (valid_date, mess_name, owner_id, is_non_veg) VALUES($1, $2, $3, $4) RETURNING *", [date, mess_name, owner, non_veg]);
            console.log("New token has been logged.");
            res.json(newToken.rows[0]);
        }
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// DELETE
// Remove resident
router.delete("/resident/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const delResident = await pool.query("DELETE FROM app_user WHERE id = $1 RETURNING *", [id]);
        console.log("Deleted resident");
        res.json(delResident.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Remove RT
router.delete("/rt/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const delRT = await pool.query("DELETE FROM app_user WHERE id = $1 RETURNING *", [id]);
        console.log("Deleted Resident Tutor");
        res.json(delRT.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Remove supervisor
router.delete("/supervisor/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const delSupervisor = await pool.query("DELETE FROM app_user WHERE id = $1 RETURNING *", [id]);
        console.log("Deleted Supervisor");
        res.json(delSupervisor.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Remove Office Staff
router.delete("/staff/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const delStaff = await pool.query("DELETE FROM app_user WHERE id = $1 RETURNING *", [id]);
        console.log("Deleted Office Staff");
        res.json(delStaff.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Remove Event
router.delete("/event/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const delEvent = await pool.query("DELETE FROM event WHERE event_id = $1 RETURNING *", [id]);
        console.log("Deleted Event");
        res.json(delEvent.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Remove Attendance(Date)
router.delete("/attendance/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const delDate = await pool.query("DELETE FROM attendance WHERE date = $1 RETURNING *", [date]);
        console.log("Deleted Attendance Date");
        res.json(delDate.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Remove absentee
router.delete("/absentee/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.body;
        const delAbsentee = await pool.query("DELETE FROM is_absent WHERE id = $1 AND date = $2 RETURNING *", [id, date]);
        console.log("Deleted Absentee");
        res.json(delAbsentee.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Remove Token
router.delete("/token/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const delToken = await pool.query("DELETE FROM token WHERE token_id = $1 RETURNING *", [id]);
        console.log("Deleted Token");
        res.json(delToken.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})


// UPDATES

// Update Resident
router.put("/resident/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { new_id, name, email, phone_no, room_no, course, department, password } = req.body;
        if (name) {
            await pool.query("UPDATE app_user SET name = $1 WHERE id = $2", [name, id]);
        }
        if (email) {
            await pool.query("UPDATE app_user SET email = $1 WHERE id = $2", [email, id]);
        }
        if (phone_no) {
            await pool.query("UPDATE app_user SET phone_no = $1 WHERE id = $2", [phone_no, id]);
        }
        if (room_no) {
            const block_id = room_no.slice(0, 1);
            await pool.query("UPDATE resident SET room_no = $1 WHERE id = $2", [room_no, id]);
            await pool.query("UPDATE resident SET block_id = $1 WHERE id = $2", [block_id, id]);
        }
        if (course) {
            await pool.query("UPDATE resident SET course = $1 WHERE id = $2", [course, id]);
        }
        if (department) {
            await pool.query("UPDATE resident SET department = $1 WHERE id = $2", [department, id]);
        }
        if (password) {
            await pool.query("UPDATE app_user SET password = $1", [password]);
        }

        if (new_id) {
            await pool.query("UPDATE app_user SET id = $1 WHERE id = $2", [new_id, id]);
            const updatedResident = await pool.query("SELECT * FROM app_user JOIN resident ON app_user.id = resident.id WHERE app_user.id = $1", [new_id]);
            res.json(updatedResident.rows[0]);
        }
        else {
            const updatedResident = await pool.query("SELECT * FROM app_user JOIN resident ON app_user.id = resident.id WHERE app_user.id = $1", [id]);
            res.json(updatedResident.rows[0]);
        }
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Update Resident Tutor
router.put("/rt/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { new_id, name, email, phone_no, room_no, password } = req.body;
        if (name) {
            await pool.query("UPDATE app_user SET name = $1 WHERE id = $2", [name, id]);
        }
        if (email) {
            await pool.query("UPDATE app_user SET email = $1 WHERE id = $2", [email, id]);
        }
        if (phone_no) {
            await pool.query("UPDATE app_user SET phone_no = $1 WHERE id = $2", [phone_no, id]);
        }
        if (password) {
            await pool.query("UPDATE app_user SET password = $1", [password]);
        }
        if (room_no) {
            const new_block_id = room_no.slice(0, 1);
            const old_block_query = await pool.query("SELECT id FROM block WHERE rt_id = $1", [id]);
            const old_block_id = old_block_query.rows[0].id
            if (new_block_id != old_block_id) {
                console.log("Resident Tutor cannot stay in a different block!");
            }
            else {
                await pool.query("UPDATE rt SET room_no = $1 WHERE id = $2", [room_no, id]);
            }
        }

        if (new_id) {
            await pool.query("UPDATE app_user SET id = $1 WHERE id = $2", [new_id, id]);
            const updatedRT = await pool.query("SELECT * FROM app_user JOIN resident_tutor ON app_user.id = resident_tutor.id WHERE app_user.id = $1", [new_id]);
            res.json(updatedRT.rows[0]);
        }
        else {
            const updatedRT = await pool.query("SELECT * FROM app_user JOIN resident_tutor ON app_user.id = resident_tutor.id WHERE app_user.id = $1", [id]);
            res.json(updatedRT.rows[0]);
        }
    } catch (err) {
        console.log(err.message);
        res.json();
    }
})

// Update Supervisor
router.put("/supervisor/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { new_id, name, email, phone_no, block_id, password } = req.body;
        if (name) {
            await pool.query("UPDATE app_user SET name = $1 WHERE id = $2", [name, id]);
        }
        if (email) {
            await pool.query("UPDATE app_user SET email = $1 WHERE id = $2", [email, id]);
        }
        if (phone_no) {
            await pool.query("UPDATE app_user SET phone_no = $1 WHERE id = $2", [phone_no, id]);
        }
        if (password) {
            await pool.query("UPDATE app_user SET password = $1", [password]);
        }
        if (block_id) {
            await pool.query("UPDATE supervisor SET block_id = $1 WHERE id = $2", [block_id, id]);
        }

        if (new_id) {
            await pool.query("UPDATE app_user SET id = $1 WHERE id = $2", [new_id, id]);
            const updatedSupervisor = await pool.query("SELECT * FROM app_user JOIN supervisor ON app_user.id = supervisor.id WHERE app_user.id = $1", [new_id]);
            res.json(updatedSupervisor.rows[0]);
        }
        else {
            const updatedSupervisor = await pool.query("SELECT * FROM app_user JOIN supervisor ON app_user.id = supervisor.id WHERE app_user.id = $1", [id]);
            res.json(updatedSupervisor.rows[0]);
        }
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Update Office Staff
router.put("/staff/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { new_id, name, email, phone_no, password } = req.body;
        if (name) {
            await pool.query("UPDATE app_user SET name = $1 WHERE id = $2", [name, id]);
        }
        if (email) {
            await pool.query("UPDATE app_user SET email = $1 WHERE id = $2", [email, id]);
        }
        if (phone_no) {
            await pool.query("UPDATE app_user SET phone_no = $1 WHERE id = $2", [phone_no, id]);
        }
        if (password) {
            await pool.query("UPDATE app_user SET password = $1", [password]);
        }

        if (new_id) {
            await pool.query("UPDATE app_user SET id = $1 WHERE id = $2", [new_id, id]);
            const updatedStaff = await pool.query("SELECT * FROM app_user JOIN office_staff ON app_user.id = office_staff.id WHERE app_user.id = $1", [new_id]);
            res.json(updatedStaff.rows[0]);
        }
        else {
            const updatedStaff = await pool.query("SELECT * FROM app_user JOIN office_staff ON app_user.id = office_staff.id WHERE app_user.id = $1", [id]);
            res.json(updatedStaff.rows[0]);
        }
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Update Event
router.put("/event/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { new_id, name, date, time, location } = req.body;
        if (name) {
            await pool.query("UPDATE event SET name = $1 WHERE event_id = $2", [name, id]);
        }
        if (date) {
            await pool.query("UPDATE event SET event_date = $1 WHERE event_id = $2", [date, id]);
        }
        if (time) {
            await pool.query("UPDATE event SET event_time = $1 WHERE event_id = $2", [time, id]);
        }
        if (location) {
            await pool.query("UPDATE event SET location = $1 WHERE event_id = $2", [location, id]);
        }

        if (new_id) {
            await pool.query("UPDATE event SET event_id = $1 WHERE event_id = $2", [new_id, id]);
            const updatedEvent = await pool.query("SELECT * FROM event WHERE event_id = $1", [new_id]);
            res.json(updatedEvent.rows[0]);
        }
        else {
            const updatedEvent = await pool.query("SELECT * FROM event WHERE event_id = $1", [id]);
            res.json(updatedEvent.rows[0]);
        }
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Update Attendance
router.put("/attendance/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const { new_date } = req.body;

        await pool.query("UPDATE attendance SET date = $1 WHERE date = $2", [new_date, date]);
        const updatedAttendance = await pool.query("SELECT * FROM attendance WHERE date = $1", [new_date]);
        res.json(updatedAttendance.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Update Absentee
router.put("/absentee/:id/:date", async (req, res) => {
    try {
        const { id, date } = req.params;
        const { new_id, new_date } = req.body;

        if (new_id && new_date) {
            await pool.query("UPDATE is_absent SET id = $1 WHERE id = $2 AND date = $3", [new_id, id, date]);
            await pool.query("UPDATE is_absent SET date = $1 WHERE id = $2 AND date = $3", [new_date, new_id, date]);
            const updatedAbsentee = await pool.query("SELECT * FROM is_absent WHERE id = $1 AND date = $2", [new_id, new_date]);
            res.json(updatedAbsentee.rows[0]);
        }
        else if (new_id) {
            await pool.query("UPDATE is_absent SET id = $1 WHERE id = $2 AND date = $3", [new_id, id, date]);
            const updatedAbsentee = await pool.query("SELECT * FROM is_absent WHERE id = $1 AND date = $2", [new_id, date]);
            res.json(updatedAbsentee.rows[0]);
        }
        else if (new_date) {
            await pool.query("UPDATE is_absent SET date = $1 WHERE id = $2 AND date = $3", [new_date, id, date]);
            const updatedAbsentee = await pool.query("SELECT * FROM is_absent WHERE id = $1 AND date = $2", [id, new_date]);
            res.json(updatedAbsentee.rows[0]);
        }
        else {
            res.json("Nothing to update!");
        }
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Update Token
router.put("/token/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { new_id, date, owner, is_non_veg } = req.body;

        if (date) {
            await pool.query("UPDATE token SET valid_date = $1 WHERE token_id = $2", [date, id]);
        }
        if (owner) {
            const mess_query = await pool.query("SELECT mess_id FROM block WHERE id = (SELECT block_id FROM resident WHERE id = $1)", [owner]);
            const mess_name = mess_query.rows[0].mess_id;
            await pool.query("UPDATE token SET owner_id = $1 WHERE token_id = $2", [owner, id]);
            await pool.query("UPDATE token SET mess_name = $1 WHERE token_id = $2", [mess_name, id]);
        }
        if (is_non_veg !== undefined || is_non_veg !== null) {
            await pool.query("UPDATE token SET is_non_veg = $1 WHERE token_id = $2", [is_non_veg, id]);
            console.log(is_non_veg);
        }

        if (new_id) {
            await pool.query("UPDATE token SET token_id = $1 WHERE token_id = $2", [new_id, id]);
            const updatedToken = await pool.query("SELECT * FROM token WHERE token_id = $1", [new_id]);
            res.json(updatedToken.rows[0]);
        }
        else {
            const updatedToken = await pool.query("SELECT * FROM token WHERE token_id = $1", [id]);
            res.json(updatedToken.rows[0]);
        }
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// GET DETAILS
// Get the list of router users
router.get("/users", async (req, res) => {
    try {
        const user_ids = await pool.query("SELECT id FROM app_user");
        const ids = user_ids.rows?.map((value) => value.id);
        res.json(ids);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get details of a user
router.get("/user/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const details = await pool.query("SELECT * FROM app_user WHERE id = $1", [id]);
        res.json(details.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get details of a resident
router.get("/resident/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const resident = await pool.query("SELECT * FROM app_user U JOIN resident R ON U.id = R.id WHERE R.id = $1", [id]);
        res.json(resident.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get details of a resident tutor
router.get("/rt/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const rt = await pool.query("SELECT * FROM app_user U JOIN resident_tutor RT ON U.id = RT.id WHERE RT.id = $1", [id]);
        res.json(rt.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get details of a supervisor
router.get("/supervisor/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const supervisor = await pool.query("SELECT * FROM app_user U JOIN supervisor S ON U.id = S.id WHERE S.id = $1", [id]);
        res.json(supervisor.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get details of an office staff
router.get("/staff/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await pool.query("SELECT * FROM app_user U JOIN office_staff S ON U.id = S.id WHERE S.id = $1", [id]);
        res.json(staff.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get details of an event
router.get("/event/:id", async (req, res) => {
    try {
        // Create a function to get all the staffs incharge of an event
        const { id } = req.params;
        const event = await pool.query("SELECT * FROM event E JOIN event_incharge EI ON E.event_id = EI.event_id WHERE E.event_id = $1", [id]);
        res.json(event.rows[0]);
    }
    catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get attendance dates
router.get("/attendance", async (req, res) => {
    try {
        const attendance = await pool.query("SELECT * FROM attendance");
        const dates = attendance.rows?.map((value) => value.date);
        res.json(dates);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get all absentees on all dates
router.get("/absentees", async (req, res) => {
    try {
        const absentees = await pool.query("SELECT * FROM is_absent");
        res.json(absentees.rows);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get absentees on a specific date
router.get("/absentees/date/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const absentees = await pool.query("SELECT * FROM is_absent WHERE date = $1", [date]);
        res.json(absentees.rows);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get attendance of a specific resident
router.get("/absentees/resident/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const absentees = await pool.query("SELECT * FROM is_absent WHERE id = $1", [id]);
        res.json(absentees.rows);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Check if a resident was present on a specific date
router.get("/absent/:id/:date", async (req, res) => {
    try {
        const { id, date } = req.params;
        const absent = await pool.query("SELECT * FROM is_absent WHERE id = $1 AND date = $2", [id, date]);
        console.log(absent.rows.length);
        if (absent.rows.length === 0) {
            res.json({
                "was_absent": false
            })
        }
        else {
            res.json({
                "was_absent": true
            })
        }
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get all token and owner IDs
router.get("/tokens", async (req, res) => {
    try {
        const token_ids = await pool.query("SELECT token_id, owner_id FROM token");
        res.json(token_ids.rows);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get all the tokens of a resident
router.get("/tokens/owner/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const tokens = await pool.query("SELECT token_id FROM token WHERE owner_id = $1", [id]);
        const token_ids = tokens.rows?.map((value) => value.token_id);
        res.json(token_ids);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get all the tokens and their owners on a specific date
router.get("/tokens/date/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const tokens = await pool.query("SELECT token_id, owner_id FROM token WHERE valid_date = $1", [date]);
        res.json(tokens.rows);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get password of an user
router.get("/password/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const password = await pool.query("SELECT password from app_user WHERE id = $1", [id]);
        res.json(password.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get user type
router.get("/user/type/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const is_resident = await pool.query("SELECT 1 FROM resident WHERE id = $1", [id]);
        const is_rt = await pool.query("SELECT 1 FROM resident_tutor WHERE id = $1", [id]);
        const is_supervisor = await pool.query("SELECT 1 FROM supervisor WHERE id = $1", [id]);
        const is_staff = await pool.query("SELECT 1 FROM office_staff WHERE id = $1", [id]);

        if (is_resident.rowCount) {
            res.json({ "Type": "Resident" });
        }
        else if (is_rt.rowCount) {
            res.json({ "Type": "Resident Tutor" });
        }
        else if (is_supervisor.rowCount) {
            res.json({ "Type": "Supervisor" });
        }
        else if (is_staff.rowCount) {
            res.json({ "Type": "Office Staff" });
        }
        else {
            res.json({ "Type": 0 });
        }
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

// Get residents of supervisor
router.get("/residents/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const residents = await pool.query("SELECT id FROM resident WHERE block_id = (SELECT block_id FROM supervisor WHERE id = $1)", [id]);
        res.json(residents.rows);
    } catch (err) {
        console.log(err.message);
        res.json({ "message": "ERROR" });
    }
})

module.exports = router;