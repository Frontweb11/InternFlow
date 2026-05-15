// src/pages/Submissions.jsx
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { submissionAPI, taskAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Send, Eye, MessageCircle, Star } from "lucide-react";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
    attachments: [],
  });
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [submissionsRes, tasksRes] = await Promise.all([
        submissionAPI.getAll(),
        taskAPI.getAll(),
      ]);
      setSubmissions(submissionsRes.data);
      setTasks(
        tasksRes.data.filter(
          (t) => t.status !== "approved" && t.status !== "submitted",
        ),
      );
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submissionAPI.create({
        task: selectedTask._id,
        content: formData.content,
        attachments: formData.attachments,
      });
      toast.success("Submission created successfully");
      setShowModal(false);
      setFormData({ content: "", attachments: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit");
    }
  };

  const handleReview = async (submissionId, feedback, score, status) => {
    try {
      await submissionAPI.review(submissionId, { feedback, score, status });
      toast.success("Submission reviewed successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to review submission");
    }
  };

  const ReviewModal = ({ submission, onClose }) => {
    const [feedback, setFeedback] = useState(submission.feedback?.text || "");
    const [score, setScore] = useState(submission.score || "");
    const [status, setStatus] = useState(submission.status);

    const handleSubmitReview = () => {
      if (!feedback || !score) {
        toast.error("Please provide feedback and score");
        return;
      }
      handleReview(submission._id, feedback, parseInt(score), status);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Review Submission</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Task: {submission.task?.title}
              </label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{submission.content}</p>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows="4"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [reviewingSubmission, setReviewingSubmission] = useState(null);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Submissions</h1>
          {!isAdmin && tasks.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              New Submission
            </button>
          )}
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {submission.task?.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted:{" "}
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {submission.score && (
                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{submission.score}%</span>
                    </div>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : submission.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">Submission Content:</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{submission.content}</p>
                </div>
              </div>

              {submission.feedback && (
                <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium">Feedback:</h3>
                  </div>
                  <p className="text-gray-700">{submission.feedback.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    By: {submission.feedback.givenBy?.name} on{" "}
                    {new Date(submission.feedback.givenAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {isAdmin && submission.status === "pending" && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setReviewingSubmission(submission)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Review Submission
                  </button>
                </div>
              )}
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No submissions found</p>
            </div>
          )}
        </div>
      </div>

      {/* New Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">New Submission</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Select Task
                  </label>
                  <select
                    value={selectedTask?._id || ""}
                    onChange={(e) => {
                      const task = tasks.find((t) => t._id === e.target.value);
                      setSelectedTask(task);
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Choose a task</option>
                    {tasks.map((task) => (
                      <option key={task._id} value={task._id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTask && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {selectedTask.description}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Deadline:{" "}
                        {new Date(selectedTask.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Your Work
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="6"
                        placeholder="Describe your work, provide links, or share your solution..."
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTask(null);
                    setFormData({ content: "", attachments: [] });
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedTask}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Submit Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingSubmission && (
        <ReviewModal
          submission={reviewingSubmission}
          onClose={() => setReviewingSubmission(null)}
        />
      )}
    </Layout>
  );
};

export default Submissions;
