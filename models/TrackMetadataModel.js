const mongoose = require('mongoose')

const trackMetadataSchema = new mongoose.Schema({
    lognumber: {
        type: String,
        require: true
    },
    configuration: { type: String },
    tape_stock: { type: String },
    contents: { type: String },
    personnel_notes: { type: String },
    connor_reference_: { type: String },
    recording_location: { type: String },
    recording_date: { type: String },
    bwf_file_name_s_: { type: String },
    duration: { type: String },
    date_of_transfer:{ type: String },
    digitizer:{ type: String },
    storage_device_s_n:{ type: String },
    service_copy:{ type: String },
    no_of_tracks:{ type: String },
    ijs_staff_date_entered:{ type: String },
    date_sent_engineer:{ type: String },
    date_returned: { type: String },
    engineer_s_notes: { type: String },
    disc_data_sheets_scanned: { type: String }
})

module.exports=mongoose.model('TrackMetadata',trackMetadataSchema)


