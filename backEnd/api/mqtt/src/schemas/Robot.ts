import mongoose from "mongoose";

const RobotSchema = new mongoose.Schema(
  {
    robot_id: { type: String, unique: true, index: true },
    status:   { type: Object,  default: {} },  // holds pose/attitude/etc
    updated_at: { type: Date, default: Date.now }
  },
  { minimize: false }
);

export default mongoose.models.Robot || mongoose.model("Robot", RobotSchema);
