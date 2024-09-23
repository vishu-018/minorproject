const Attendance = require('../models/Attendance');


// Mark attendance
exports.markAttendance = async (req, res) => {

    try {
        const { Name, status } = req.body;
        const newAttendance = new Attendance({ Name, status });
        await newAttendance.save();
        req.flash("success","marked");
        res.redirect("/listings");
    } catch (err) {
        console.error('Error marking attendance:', err);
        res.status(500).send('Internal Server Error');
    }
};

// Get attendance records
exports.getAttendance = async (req, res) => {
    let id=req.params.id;
    console.log(id);
    try {
        const attendanceRecords = await Attendance.find();
        res.render('./listings/getattendance.ejs', { attendanceRecords });
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).send('Internal Server Error');
    }
};

