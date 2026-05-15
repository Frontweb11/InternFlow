const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    intern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    feedback: {
      text: String,
      givenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      givenAt: Date,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Submission", submissionSchema);
